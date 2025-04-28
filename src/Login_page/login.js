import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            console.log('Login attempted');
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    const handleUploadClick = () => {
        navigate('/upload');
    };

    return (
        <div className="login-container">
            <div className="header">
                <img src="/images/mu-sigma-logo-1.png" alt="Mu Sigma" className="musigma-logo" />
            </div>
            
            <div className="login-form-container">
                <div className="tariffs-illustration">
                    <div className="tariffs-icon">
                        <span>📊</span>
                        <span>💹</span>
                        <span>📈</span>
                    </div>
                    <h3>Tariffs Management System</h3>
                    <p>Access your dashboard to manage and analyze tariffs data</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    <h2>Welcome</h2>
                    <div className="form-group">
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? "Loading..." : "Start"}
                        </button>
                        <button 
                            type="button"
                            className="info-button" 
                            onClick={handleUploadClick}
                        >
                            Upload Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
