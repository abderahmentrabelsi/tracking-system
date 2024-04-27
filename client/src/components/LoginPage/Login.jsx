import React, { useState } from "react";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

const Login=()=>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:4040/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                // Login successful, extract JWT token from response and store it
                const { token } = await response.json();
                localStorage.setItem("token", token); // Store token in localStorage or sessionStorage
                // Navigate to the dashboard page if login correct
            } else {
                // Login failed, display error message
                const { message } = await response.json();
                setError(message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    return (
        <div className="base-container">
            <div className="header">QORE VIRTUAL</div>
            <div className="content">
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            required
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={handleEmailChange}
                        />
                        <FaUser className="icons" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            required
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                        <RiLockPasswordFill className="icons" />
                    </div>
                    <div className="remember">
                        <label>
                            <input type="checkbox" />Remember me
                        </label>
                        <a href="#"> Issue to connect ? </a>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className="footer">
                        <button type="submit" className="btn">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Login;