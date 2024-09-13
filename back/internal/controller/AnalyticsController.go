package controller

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/analyticsdata/v1beta"
	"google.golang.org/api/option"
)

// AnalyticsData represents the structure of analytics data
type AnalyticsData struct {
	City                   string  `json:"city"`
	Region                 string  `json:"region"`
	Country                string  `json:"country"`
	PagePath               string  `json:"pagePath"`
	ActiveUsers            int64   `json:"activeUsers"`
	AverageSessionDuration float64 `json:"averageSessionDuration"`
	BounceRate             float64 `json:"bounceRate"`
	ScreenPageViews        int64   `json:"screenPageViews"`
	Sessions               int64   `json:"sessions"`
	NewUsers               int64   `json:"newUsers"`
	EventCount             int64   `json:"eventCount"`
	Conversions            int64   `json:"conversions"`
	Revenue                float64 `json:"revenue"`
	DeviceCategory         string  `json:"deviceCategory"`
	Date                   string  `json:"date"` // Added for tracking activity over time
}

// AggregateMetrics represents the structure of aggregate metrics
type AggregateMetrics struct {
	TotalActiveUsers         int64   `json:"totalActiveUsers"`
	AverageSessionDuration   float64 `json:"averageSessionDuration"`
	TotalSessions            int64   `json:"totalSessions"`
	TotalScreenPageViews     int64   `json:"totalScreenPageViews"`
	TotalNewUsers            int64   `json:"totalNewUsers"`
	TotalEventCount          int64   `json:"totalEventCount"`
	TotalConversions         int64   `json:"totalConversions"`
	TotalRevenue             float64 `json:"totalRevenue"`
	AverageBounceRate        float64 `json:"averageBounceRate"`
	TopCityByActiveUsers     string  `json:"topCityByActiveUsers"`
	TopPageByScreenPageViews string  `json:"topPageByScreenPageViews"`
	TopRegionByRevenue       string  `json:"topRegionByRevenue"`
}

// ErrorResponse represents the structure of an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// AnalyticsResponse represents the structure of the full response
type AnalyticsResponse struct {
	AnalyticsData    []AnalyticsData  `json:"analyticsData"`
	AggregateMetrics AggregateMetrics `json:"aggregateMetrics"`
}

// GetAnalyticsData godoc
// @Summary Get Analytics Data
// @Description Get analytics data from Google Analytics
// @Tags analytics
// @Produce json
// @Success 200 {object} AnalyticsResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /analytics [get]
// @OperationId GetAnalyticsData
func GetAnalyticsData(c *gin.Context) {
	ctx := context.Background()

	dir, err := os.Getwd()
	if err != nil {
		handleError(c, fmt.Errorf("failed to get current working directory: %w", err), http.StatusInternalServerError)
		return
	}

	credentialsPath := dir + "/cred.json"
	if _, err := os.Stat(credentialsPath); os.IsNotExist(err) {
		handleError(c, fmt.Errorf("credentials file not found: %s", credentialsPath), http.StatusInternalServerError)
		return
	}

	// Initialize the Analytics service
	analyticsService, err := analyticsdata.NewService(ctx, option.WithCredentialsFile(credentialsPath))
	if err != nil {
		handleError(c, fmt.Errorf("failed to create analytics data service: %w", err), http.StatusInternalServerError)
		return
	}

	propertyID := os.Getenv("PROPERTY_ID")
	if propertyID == "" {
		handleError(c, fmt.Errorf("PROPERTY_ID environment variable is not set"), http.StatusBadRequest)
		return
	}

	// Define the date range for the report dynamically
	currentTime := time.Now()
	startDate := currentTime.AddDate(0, -1, 0).Format("2006-01-02") // One month ago
	endDate := currentTime.Format("2006-01-02")                     // Today

	dateRange := &analyticsdata.DateRange{
		StartDate: startDate,
		EndDate:   endDate,
	}

	// Define the dimensions and metrics for the report
	dimensions := []*analyticsdata.Dimension{
		{Name: "city"},
		{Name: "region"},
		{Name: "country"},
		{Name: "pagePath"},
		{Name: "deviceCategory"},
		{Name: "date"}, // Added to track data over time
	}
	metrics := []*analyticsdata.Metric{
		{Name: "activeUsers"},
		{Name: "averageSessionDuration"},
		{Name: "bounceRate"},
		{Name: "screenPageViews"},
		{Name: "sessions"},
		{Name: "newUsers"},
		{Name: "eventCount"},
		{Name: "conversions"},
		{Name: "totalRevenue"},
	}

	// Create the report request
	request := &analyticsdata.RunReportRequest{
		Property:   "properties/" + propertyID,
		Dimensions: dimensions,
		Metrics:    metrics,
		DateRanges: []*analyticsdata.DateRange{dateRange},
	}

	// Run the report
	response, err := analyticsService.Properties.RunReport("properties/"+propertyID, request).Do()
	if err != nil {
		handleError(c, fmt.Errorf("failed to run report: %w", err), http.StatusInternalServerError)
		return
	}

	// Log the response for debugging
	log.Printf("Response: %+v", response)

	// Check if the report contains row data
	if len(response.Rows) == 0 {
		handleError(c, fmt.Errorf("no data found for the specified report"), http.StatusOK)
		return
	}

	// Extract data for the response
	var analyticsData []AnalyticsData
	var totalActiveUsers, totalSessions, totalScreenPageViews, totalNewUsers, totalEventCount, totalConversions int64
	var totalRevenue, totalBounceRate, totalSessionDuration float64
	var cityActiveUsers = make(map[string]int64)
	var pageScreenPageViews = make(map[string]int64)
	var regionRevenue = make(map[string]float64)

	for _, row := range response.Rows {
		var data AnalyticsData
		for i, dimension := range row.DimensionValues {
			switch dimensions[i].Name {
			case "city":
				data.City = dimension.Value
			case "region":
				data.Region = dimension.Value
			case "country":
				data.Country = dimension.Value
			case "pagePath":
				data.PagePath = dimension.Value
			case "deviceCategory":
				data.DeviceCategory = dimension.Value
			case "date":
				data.Date = formatDateString(dimension.Value) // Format the date
			}
		}
		for i, metric := range row.MetricValues {
			switch metrics[i].Name {
			case "activeUsers":
				data.ActiveUsers = parseInt64(metric.Value)
				totalActiveUsers += data.ActiveUsers
				cityActiveUsers[data.City] += data.ActiveUsers
			case "averageSessionDuration":
				data.AverageSessionDuration = parseFloat64(metric.Value)
				totalSessionDuration += data.AverageSessionDuration
			case "bounceRate":
				data.BounceRate = parseFloat64(metric.Value)
				totalBounceRate += data.BounceRate
			case "screenPageViews":
				data.ScreenPageViews = parseInt64(metric.Value)
				totalScreenPageViews += data.ScreenPageViews
				pageScreenPageViews[data.PagePath] += data.ScreenPageViews
			case "sessions":
				data.Sessions = parseInt64(metric.Value)
				totalSessions += data.Sessions
			case "newUsers":
				data.NewUsers = parseInt64(metric.Value)
				totalNewUsers += data.NewUsers
			case "eventCount":
				data.EventCount = parseInt64(metric.Value)
				totalEventCount += data.EventCount
			case "conversions":
				data.Conversions = parseInt64(metric.Value)
				totalConversions += data.Conversions
			case "totalRevenue":
				data.Revenue = parseFloat64(metric.Value)
				totalRevenue += data.Revenue
				regionRevenue[data.Region] += data.Revenue
			}
		}
		analyticsData = append(analyticsData, data)
	}

	// Calculate aggregates and interesting metrics
	aggregateMetrics := AggregateMetrics{
		TotalActiveUsers:         totalActiveUsers,
		AverageSessionDuration:   totalSessionDuration / float64(len(response.Rows)),
		TotalSessions:            totalSessions,
		TotalScreenPageViews:     totalScreenPageViews,
		TotalNewUsers:            totalNewUsers,
		TotalEventCount:          totalEventCount,
		TotalConversions:         totalConversions,
		TotalRevenue:             totalRevenue,
		AverageBounceRate:        totalBounceRate / float64(len(response.Rows)),
		TopCityByActiveUsers:     getMaxKeyInt64(cityActiveUsers),
		TopPageByScreenPageViews: getMaxKeyInt64(pageScreenPageViews),
		TopRegionByRevenue:       getMaxKeyFloat64(regionRevenue),
	}

	// Return the analytics report data as JSON
	c.JSON(http.StatusOK, AnalyticsResponse{
		AnalyticsData:    analyticsData,
		AggregateMetrics: aggregateMetrics,
	})
}

// Helper functions to parse metric values
func parseInt64(value string) int64 {
	v, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		log.Printf("Failed to parse int64: %v", err)
	}
	return v
}

func parseFloat64(value string) float64 {
	v, err := strconv.ParseFloat(value, 64)
	if err != nil {
		log.Printf("Failed to parse float64: %v", err)
	}
	return v
}

// Helper function to format date string from "YYYYMMDD" to "YYYY-MM-DD"
func formatDateString(dateStr string) string {
	if len(dateStr) != 8 {
		return dateStr // return the original string if it's not in the expected format
	}
	return dateStr[:4] + "-" + dateStr[4:6] + "-" + dateStr[6:]
}

// Helper function to get the key with the maximum value from a map of int64
func getMaxKeyInt64(m map[string]int64) string {
	var maxKey string
	var maxValue int64
	for k, v := range m {
		if v > maxValue {
			maxKey = k
			maxValue = v
		}
	}
	return maxKey
}

// Helper function to get the key with the maximum value from a map of float64
func getMaxKeyFloat64(m map[string]float64) string {
	var maxKey string
	var maxValue float64
	for k, v := range m {
		if v > maxValue {
			maxKey = k
			maxValue = v
		}
	}
	return maxKey
}

// handleError is a helper function to return consistent error responses
func handleError(c *gin.Context, err error, statusCode int) {
	log.Printf("Error: %v", err)
	c.JSON(statusCode, ErrorResponse{Error: err.Error()})
}
