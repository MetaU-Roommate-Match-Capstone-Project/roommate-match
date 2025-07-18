import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUrl } from "../../utils/url";
import Spinner from "../../components/Spinner/Spinner";

const CreateAccount = () => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    dobMonth: "",
    dobDay: "",
    dobYear: "",
    gender: "",
    internOrNewGrad: "",
    budgetMin: "",
    budgetMax: "",
    university: "",
    company: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    countryCode: "",
    phoneFirstThree: "",
    phoneMiddleThree: "",
    phoneLastFour: "",
    instagramHandle: "",
    groupId: "",
  });

  const [step, setStep] = useState(1);
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createUser = async (userData) => {
    try {
      const response = await fetch(`${getUrl()}/api/users/create-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateFormField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFirstStepSubmit = (e) => {
    e.preventDefault();

    if (formState.password !== formState.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    // error messages for buttons not being selected because no required attribute for buttons
    if (!formState.gender) {
      setSubmitError("Please select a gender");
      setIsSubmitting(false);
      return;
    }

    if (!formState.internOrNewGrad) {
      setSubmitError("Please select a status");
      setIsSubmitting(false);
      return;
    }

    // validate budget range
    if (parseInt(formState.budgetMin) >= parseInt(formState.budgetMax)) {
      setSubmitError(
        "Budget minimum cannot be greater than or equal to maximum",
      );
      setIsSubmitting(false);
      return;
    }

    // validate date of birth year
    if (parseInt(formState.dobYear) <= 1920) {
      setSubmitError("Birth year must be after 1920");
      setIsSubmitting(false);
      return;
    }

    // validate phone number if user has entered any one of the phone number fields (all or none should be filled)
    const validateOptionalPhone = (phoneFields) => {
      if (!parseInt(formState.countryCode)) {
        return false;
      }
      if (!parseInt(formState.phoneFirstThree)) {
        return false;
      }
      if (!parseInt(formState.phoneMiddleThree)) {
        return false;
      }
      if (!parseInt(formState.phoneLastFour)) {
        return false;
      }

      const hasAPhoneFieldFilled = phoneFields.some(
        (field) => field.trim() !== "",
      );

      if (hasAPhoneFieldFilled) {
        for (const field of phoneFields) {
          if (field.trim() === "") {
            return false;
          }
        }
        return true;
      }

      return true;
    };

    const phoneValidation = validateOptionalPhone([
      formState.countryCode,
      formState.phoneFirstThree,
      formState.phoneMiddleThree,
      formState.phoneLastFour,
    ]);

    if (!phoneValidation) {
      setSubmitError(
        "Please complete all phone number fields with numerical inputs or leave them all empty",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const dobDate = new Date(
        parseInt(formState.dobYear),
        parseInt(formState.dobMonth) - 1,
        parseInt(formState.dobDay),
      );

      const dob = dobDate.toISOString();

      const officeAddress = `${formState.streetAddress}, ${formState.city}, ${formState.state} ${formState.zipCode}`;

      const phoneNumber = `+${formState.countryCode} (${formState.phoneFirstThree})-${formState.phoneMiddleThree}-${formState.phoneLastFour}`;

      const instagramHandle = `@${formState.instagramHandle}`;

      const userData = {
        name: formState.name,
        email: formState.email,
        password: formState.password,
        dob,
        gender: formState.gender,
        intern_or_new_grad: formState.internOrNewGrad,
        budget_min: parseInt(formState.budgetMin),
        budget_max: parseInt(formState.budgetMax),
        university: formState.university,
        company: formState.company,
        office_address: officeAddress,
        phone_number: phoneNumber,
        instagram_handle: instagramHandle,
      };

      await createUser(userData);

      navigate("/login");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="form-container">
        <div className="form-card">
          <h2>Create Account</h2>
          {step === 1 ? (
            <form onSubmit={handleFirstStepSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-input"
                  type="email"
                  id="email"
                  value={formState.email}
                  onChange={(e) => updateFormField("email", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  className="form-input"
                  type="password"
                  id="password"
                  value={formState.password}
                  onChange={(e) => updateFormField("password", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  className="form-input"
                  type="password"
                  id="confirmPassword"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    updateFormField("confirmPassword", e.target.value)
                  }
                  required
                />
              </div>

              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              <button type="submit" className="btn-primary">
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="name"
                  value={formState.name}
                  onChange={(e) => updateFormField("name", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <div className="date-container">
                  <input
                    type="text"
                    placeholder="MM"
                    maxLength="2"
                    value={formState.dobMonth}
                    onChange={(e) =>
                      updateFormField("dobMonth", e.target.value)
                    }
                    className="form-input-small"
                    required
                  />
                  <span className="date-separator">/</span>
                  <input
                    type="text"
                    placeholder="DD"
                    maxLength="2"
                    value={formState.dobDay}
                    onChange={(e) => updateFormField("dobDay", e.target.value)}
                    className="form-input-small"
                    required
                  />
                  <span className="date-separator">/</span>
                  <input
                    type="text"
                    placeholder="YYYY"
                    maxLength="4"
                    value={formState.dobYear}
                    onChange={(e) => updateFormField("dobYear", e.target.value)}
                    className="form-input-medium"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="button-group">
                  <button
                    type="button"
                    className={`btn-option ${formState.gender === "female" ? "btn-option-selected" : ""}`}
                    onClick={() => updateFormField("gender", "female")}
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    className={`btn-option ${formState.gender === "male" ? "btn-option-selected" : ""}`}
                    onClick={() => updateFormField("gender", "male")}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`btn-option ${formState.gender === "non-binary" ? "btn-option-selected" : ""}`}
                    onClick={() => updateFormField("gender", "non-binary")}
                  >
                    Non-Binary
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="button-group">
                  <button
                    type="button"
                    className={`btn-option ${formState.internOrNewGrad === "intern" ? "btn-option-selected" : ""}`}
                    onClick={() => updateFormField("internOrNewGrad", "intern")}
                  >
                    Intern
                  </button>
                  <button
                    type="button"
                    className={`btn-option ${formState.internOrNewGrad === "new grad" ? "btn-option-selected" : ""}`}
                    onClick={() =>
                      updateFormField("internOrNewGrad", "new grad")
                    }
                  >
                    New Grad
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="university">
                  University
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="university"
                  value={formState.university}
                  onChange={(e) =>
                    updateFormField("university", e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="company">
                  Company
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="company"
                  value={formState.company}
                  onChange={(e) => updateFormField("company", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Office Address</label>
                <div className="address-container">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formState.streetAddress}
                    onChange={(e) =>
                      updateFormField("streetAddress", e.target.value)
                    }
                    className="form-input"
                    required
                  />
                  <div className="city-state-zip-layout">
                    <input
                      type="text"
                      placeholder="City"
                      value={formState.city}
                      onChange={(e) => updateFormField("city", e.target.value)}
                      className="form-input flex-[2]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      maxLength="2"
                      value={formState.state}
                      onChange={(e) =>
                        updateFormField("state", e.target.value.toUpperCase())
                      }
                      className="form-input flex-1"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      maxLength="5"
                      value={formState.zipCode}
                      onChange={(e) =>
                        updateFormField("zipCode", e.target.value)
                      }
                      className="form-input flex-1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Budget Range</label>
                <div className="budget-container">
                  <input
                    type="number"
                    placeholder="Min"
                    value={formState.budgetMin}
                    onChange={(e) =>
                      updateFormField("budgetMin", e.target.value)
                    }
                    className="form-input-medium"
                    required
                  />
                  <span className="separator">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={formState.budgetMax}
                    onChange={(e) =>
                      updateFormField("budgetMax", e.target.value)
                    }
                    className="form-input-medium"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (optional)</label>
                <div className="phone-container">
                  <input
                    type="text"
                    placeholder="+1"
                    maxLength="3"
                    value={formState.countryCode}
                    onChange={(e) =>
                      updateFormField("countryCode", e.target.value)
                    }
                    className="form-input-small"
                  />
                  <input
                    type="text"
                    placeholder="XXX"
                    maxLength="3"
                    value={formState.phoneFirstThree}
                    onChange={(e) =>
                      updateFormField("phoneFirstThree", e.target.value)
                    }
                    className="form-input-medium"
                  />
                  <span className="separator">-</span>
                  <input
                    type="text"
                    placeholder="XXX"
                    maxLength="3"
                    value={formState.phoneMiddleThree}
                    onChange={(e) =>
                      updateFormField("phoneMiddleThree", e.target.value)
                    }
                    className="form-input-medium"
                  />
                  <span className="separator">-</span>
                  <input
                    type="text"
                    placeholder="XXXX"
                    maxLength="4"
                    value={formState.phoneLastFour}
                    onChange={(e) =>
                      updateFormField("phoneLastFour", e.target.value)
                    }
                    className="form-input-medium"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="instagramHandle">
                  Instagram Handle (optional)
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="instagramHandle"
                  value={formState.instagramHandle}
                  onChange={(e) =>
                    updateFormField("instagramHandle", e.target.value)
                  }
                />
              </div>

              {submitError && (
                <div className="error-message">{submitError}</div>
              )}

              <div className="button-group">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : "Create Account"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateAccount;
