package tests

import (
	"back/internal/controller"
	model "back/internal/model"
	"back/internal/orm"
	"back/internal/repository"
	"back/internal/service"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"
)

var (
	workHoursService    *service.WorkHoursService
	timesheetController *controller.TimesheetController
)

func setupTimesheetController() {
	workHoursRepo := repository.NewWorkHoursRepository()
	workHoursService = service.NewWorkHoursService(workHoursRepo)
	timesheetController = controller.NewTimesheetController(workHoursService)
}

// Helper function to convert int64 to *int64
func int64Ptr(i int64) *int64 {
	return &i
}

// Test for CheckIn method in TimesheetController
func TestTimesheetController_CheckIn(t *testing.T) {
	setupTimesheetController()

	requestBody := `{
		"userID": 1,
		"workType": "Remote",
		"location": "Home",
		"comments": "Started working"
	}`

	req := httptest.NewRequest("POST", "/checkin", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	timesheetController.CheckIn(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	workHoursID := uint(response["data"].(map[string]interface{})["ID"].(float64))
	orm.DB.Unscoped().Delete(&model.WorkHours{}, workHoursID)
}

// Test for CheckOut method in TimesheetController
func TestTimesheetController_CheckOut(t *testing.T) {
	setupTimesheetController()

	// First, check in to create a workHours record
	workHours, err := workHoursService.CheckIn(1, "Remote", "Home", "Started working", nil)
	assert.NoError(t, err)

	req := httptest.NewRequest("POST", "/checkout/"+strconv.Itoa(int(workHours.ID)), nil)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = gin.Params{{Key: "id", Value: strconv.Itoa(int(workHours.ID))}}
	c.Request = req

	timesheetController.CheckOut(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&workHours)
}

// Test for GetTimesheet method in TimesheetController
func TestTimesheetController_GetTimesheet(t *testing.T) {
	setupTimesheetController()

	// Check in twice to create work hours records
	workHours1, err := workHoursService.CheckIn(1, "Remote", "Home", "Started working", nil)
	assert.NoError(t, err)
	workHours2, err := workHoursService.CheckIn(1, "Remote", "Home", "Continued working", nil)
	assert.NoError(t, err)

	req := httptest.NewRequest("GET", "/timesheet/1", nil)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = gin.Params{{Key: "userID", Value: "1"}}
	c.Request = req

	timesheetController.GetTimesheet(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])
	assert.Len(t, response["data"].([]interface{}), 2)

	// Cleanup
	orm.DB.Unscoped().Delete(&workHours1)
	orm.DB.Unscoped().Delete(&workHours2)
}

// Test for RequestEdit method in TimesheetController
func TestTimesheetController_RequestEdit(t *testing.T) {
	setupTimesheetController()

	// First, check in to create a workHours record
	workHours, err := workHoursService.CheckIn(1, "Remote", "Home", "Started working", nil)
	assert.NoError(t, err)

	newCheckin := int64Ptr(time.Now().Add(-time.Hour).Unix())
	newCheckout := int64Ptr(time.Now().Unix())
	requestBody := fmt.Sprintf(`{
		"workHoursID": %d,
		"editRequestMsg": "Correcting time",
		"requestCheckin": %d,
		"requestCheckout": %d,
		"requestDuration": 1.5
	}`, workHours.ID, *newCheckin, *newCheckout)

	req := httptest.NewRequest("POST", "/request-edit", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	timesheetController.RequestEdit(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&workHours)
}

// Test for ApproveEdit method in TimesheetController
func TestTimesheetController_ApproveEdit(t *testing.T) {
	setupTimesheetController()

	// First, check in to create a workHours record
	workHours, err := workHoursService.CheckIn(1, "Remote", "Home", "Started working", nil)
	assert.NoError(t, err)

	newCheckin := int64Ptr(time.Now().Add(-time.Hour).Unix())
	newCheckout := int64Ptr(time.Now().Unix())
	newDuration := float32(1.5)

	// Request an edit first
	_, err = workHoursService.RequestEdit(workHours.ID, "Correcting time", newCheckin, newCheckout, &newDuration)
	assert.NoError(t, err)

	requestBody := fmt.Sprintf(`{
		"workHoursID": %d,
		"approved": true,
		"managerComment": "Approved by manager",
		"requestCheckin": %d,
		"requestCheckout": %d,
		"requestDuration": 1.5
	}`, workHours.ID, *newCheckin, *newCheckout)

	req := httptest.NewRequest("POST", "/approve-edit", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	timesheetController.ApproveEdit(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&workHours)
}

/*
// Test for GetTimesheetByDateRange method in TimesheetController
func TestTimesheetController_GetTimesheetByDateRange(t *testing.T) {
	setupTimesheetController()

	// Check in twice to create work hours records
	workHours1, err := workHoursService.CheckIn(1, "Remote", "Home", "Started working", nil)
	assert.NoError(t, err)
	_, err = workHoursService.CheckOut(workHours1.ID)
	assert.NoError(t, err)
	workHours2, err := workHoursService.CheckIn(1, "Remote", "Home", "Continued working", nil)
	assert.NoError(t, err)
	_, err = workHoursService.CheckOut(workHours2.ID)
	assert.NoError(t, err)

	requestBody := `{
		"startDate": "2024-08-09",
		"endDate": "2024-08-11"
	}`

	req := httptest.NewRequest("POST", "/timesheet-by-date", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	timesheetController.GetTimesheetByDateRange(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])
	assert.Len(t, response["data"].([]interface{}), 2)

	// Cleanup
	orm.DB.Unscoped().Delete(&workHours1)
	orm.DB.Unscoped().Delete(&workHours2)
}
*/
