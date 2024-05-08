import React, { useState ,useEffect} from "react";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import "./login.css";

const Login=()=>{
    useEffect(() => {
        // Add class to body element when component mounts
        document.body.classList.add("login-body");

        // Remove class from body element when component unmounts
        return () => {
            document.body.classList.remove("login-body");
        };
    }, []);


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
            const response = await fetch("http://localhost:8383/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ Email: email, Password: password })
            });

            if (response.ok) {
                // Login successful, extract JWT token from response and store it
                const { access_token } = await response.json();
                document.cookie = `access_token=${access_token}; path=/`; // Store token in cookies
                // Navigate to the dashboard page if login correct
            } else {
                // Login failed, display error message
                const { error } = await response.json();
                setError(error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };


    return (
        <form className="base-container" onSubmit={handleSubmit}>
            <div className="header">QORE VIRTUAL</div>
            <div className="content">
                <div className="form">
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
                        <p> </p>
                        <a href="/report-issue" className="pass-txt"> Issue to connect ?   </a>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className="footer">
                        <button type="submit" className="btn">
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};
export default Login;