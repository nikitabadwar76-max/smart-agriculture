"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../../lib/api";

export default function FarmerRegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        farmer_name: "",
        email: "",
        password: "",
        mobile: "",
        location: "",
        address: ""
    });

    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            setProfileImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/farmers/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        farmer_name: form.farmer_name,
                        email: form.email,
                        password: form.password,
                        mobile: form.mobile,
                        location: form.location,
                        address: form.address
                    })
                }
            );

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    `Backend returned invalid response. Status: ${response.status}`
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Farmer registration failed"
                );
            }

            setMessage(
                data.message ||
                "Farmer registered successfully!"
            );

            setForm({
                farmer_name: "",
                email: "",
                password: "",
                mobile: "",
                location: "",
                address: ""
            });

            setProfileImage(null);

            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (err: any) {
            console.error(
                "❌ Farmer registration error:",
                err
            );

            setError(
                err.message ||
                "Something went wrong"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="farmer-register-page">

            <div className="farmer-register-card">

                {/* HEADER */}

                <div className="register-header">

                    <div className="farmer-icon">
                        👨‍🌾
                    </div>

                    <h1>
                        Farmer Registration
                    </h1>

                    <p>
                        Create your farmer account and
                        start selling fresh farm products.
                    </p>

                </div>

                {/* SUCCESS MESSAGE */}

                {message && (
                    <div className="success-message">
                        ✅ {message}
                    </div>
                )}

                {/* ERROR MESSAGE */}

                {error && (
                    <div className="error-message">
                        ❌ {error}
                    </div>
                )}

                {/* FORM */}

                <form onSubmit={handleSubmit}>

                    {/* FARMER NAME */}

                    <div className="form-group">

                        <label>
                            Farmer Name *
                        </label>

                        <input
                            type="text"
                            name="farmer_name"
                            value={form.farmer_name}
                            onChange={handleChange}
                            placeholder="Enter farmer name"
                            required
                        />

                    </div>

                    {/* EMAIL */}

                    <div className="form-group">

                        <label>
                            Email *
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            required
                        />

                    </div>

                    {/* PASSWORD */}

                    <div className="form-group">

                        <label>
                            Password *
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Create password"
                            minLength={6}
                            required
                        />

                    </div>

                    {/* MOBILE */}

                    <div className="form-group">

                        <label>
                            Mobile Number *
                        </label>

                        <input
                            type="tel"
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            placeholder="Enter 10 digit mobile number"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                        />

                    </div>

                    {/* LOCATION */}

                    <div className="form-group">

                        <label>
                            Location *
                        </label>

                        <input
                            type="text"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="Example: Kopargaon"
                            required
                        />

                    </div>

                    {/* ADDRESS */}

                    <div className="form-group">

                        <label>
                            Address *
                        </label>

                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Enter complete address"
                            rows={4}
                            required
                        />

                    </div>

                    {/* PROFILE IMAGE */}

                    <div className="form-group">

                        <label>
                            Profile Image
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        {profileImage && (
                            <small>
                                Selected: {profileImage.name}
                            </small>
                        )}

                    </div>

                    {/* SUBMIT */}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Registering..."
                            : "🌱 Register as Farmer"}
                    </button>

                </form>

                {/* LOGIN */}

                <div className="login-link">

                    Already have an account?{" "}

                    <span
                        onClick={() =>
                            router.push("/login")
                        }
                    >
                        Login
                    </span>

                </div>

                {/* HOME */}

                <div className="home-link">

                    <span
                        onClick={() =>
                            router.push("/")
                        }
                    >
                        ← Back to Home
                    </span>

                </div>

            </div>

            <style jsx>{`

                .farmer-register-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    background:
                        linear-gradient(
                            135deg,
                            #f1f8f3,
                            #ffffff
                        );
                }

                .farmer-register-card {
                    width: 100%;
                    max-width: 620px;
                    background: white;
                    padding: 40px;
                    border-radius: 22px;
                    box-shadow:
                        0 15px 45px
                        rgba(0, 0, 0, 0.10);
                }

                .register-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .farmer-icon {
                    font-size: 52px;
                    margin-bottom: 10px;
                }

                .register-header h1 {
                    margin: 0;
                    color: #17351f;
                    font-size: 30px;
                }

                .register-header p {
                    color: #6b776e;
                    margin-top: 10px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #26382b;
                    font-weight: 600;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 13px 14px;
                    border: 1px solid #d5dfd7;
                    border-radius: 10px;
                    font-size: 15px;
                    background: #ffffff;
                    outline: none;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: #2f8f46;
                    box-shadow:
                        0 0 0 3px
                        rgba(47, 143, 70, 0.10);
                }

                .form-group textarea {
                    resize: vertical;
                }

                .form-group small {
                    display: block;
                    margin-top: 7px;
                    color: #66736a;
                }

                button {
                    width: 100%;
                    padding: 15px;
                    border: none;
                    border-radius: 11px;
                    background: #2f8f46;
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                }

                button:hover {
                    background: #25753a;
                }

                button:disabled {
                    background: #91ad98;
                    cursor: not-allowed;
                }

                .success-message {
                    background: #e9f8ed;
                    color: #207238;
                    padding: 13px;
                    border-radius: 9px;
                    margin-bottom: 20px;
                }

                .error-message {
                    background: #fff0f0;
                    color: #c62828;
                    padding: 13px;
                    border-radius: 9px;
                    margin-bottom: 20px;
                }

                .login-link {
                    text-align: center;
                    margin-top: 25px;
                    color: #66736a;
                }

                .login-link span,
                .home-link span {
                    color: #2f8f46;
                    font-weight: 700;
                    cursor: pointer;
                }

                .home-link {
                    text-align: center;
                    margin-top: 15px;
                }

            `}</style>

        </main>
    );
}