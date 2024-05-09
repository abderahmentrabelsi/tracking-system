import { useState } from "react";
import './register.css';

export const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [departmentID, setDepartmentID] = useState(1); // Default department ID
    const [role, setRole] = useState("role");

    const getIsFormValid = () => {
        return (
            firstName &&
            validateEmail(email) &&
            role !== "role"
        );
    };

    const clearForm = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("");
        setDepartmentID(1);
        setRole("role");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('backend_api_url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FirstName: firstName,
                    LastName: lastName,
                    PhoneNumber: phoneNumber,
                    Email: email,
                    DepartmentID: departmentID,
                    Role: role
                })
            });
            // Handle response as needed (e.g., show success message)
            alert("Account created!");
            clearForm();
        } catch (error) {
            // Handle error (e.g., show error message)
            console.error('Error registering:', error);
        }
    };

    return (
        <div className="App">
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <h2>Sign Up</h2>
                    <div className="Field">
                        <label>
                            First name <sup>*</sup>
                        </label>
                        <input
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                            }}
                            placeholder="First name"
                        />
                    </div>
                    <div className="Field">
                        <label>Last name</label>
                        <input
                            value={lastName}
                            onChange={(e) => {
                                setLastName(e.target.value);
                            }}
                            placeholder="Last name"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Email address <sup>*</sup>
                        </label>
                        <input
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            placeholder="Email address"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Phone number <sup>*</sup>
                        </label>
                        <input
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                            }}
                            placeholder="Phone number"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Department ID <sup>*</sup>
                        </label>
                        <input
                            type="number"
                            value={departmentID}
                            onChange={(e) => {
                                setDepartmentID(parseInt(e.target.value));
                            }}
                            placeholder="Department ID"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Role <sup>*</sup>
                        </label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="ExecutiveBoard">ExecutiveBoard</option>
                            <option value="Manager">Manager</option>
                            <option value="Employee">Employee</option>
                        </select>
                    </div>
                    <button type="submit" disabled={!getIsFormValid()}>
                        Create account
                    </button>
                </fieldset>
            </form>
        </div>
    );
}

export default Register;
