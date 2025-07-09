import React from "react";
import { useState } from "react";

const NewPostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formState, setFormState] = useState({
    city: "",
    state: "",
    content: "",
    pictures: [],
  });
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePictureUpload = (e) => {
    const files = Array.from(e.target.files);

    setFormState((prev) => ({
      ...prev,
      pictures: [...prev.pictures, ...files],
    }));
  };

  const removePicture = (index) => {
    setFormState((prev) => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formState);

      // clear form fields for when button pressed again
      setFormState({
        city: "",
        state: "",
        content: "",
        pictures: [],
      });

      onClose();
    } catch (error) {
      setSubmitError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="x-btn" onClick={onClose}>
            &times;
          </span>
          <div className="modal">
            <h2>Create a New post</h2>
            <form onSubmit={handleSubmit}>
              <div className="new-post-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    City
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="city"
                    value={formState.city}
                    onChange={(e) => updateFormField("city", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="state">
                    State
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="state"
                    value={formState.state}
                    onChange={(e) => updateFormField("state", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="content">
                  Content
                </label>
                <textarea
                  className="form-textarea"
                  id="content"
                  value={formState.content}
                  onChange={(e) => updateFormField("content", e.target.value)}
                  placeholder="Enter your post content here"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pictures">
                  Pictures (Optional)
                </label>
                <input
                  className="form-input"
                  type="file"
                  id="pictures"
                  multiple
                  accept="image/*"
                  onChange={handlePictureUpload}
                />
                <p className="new-post-file-instructions">
                  Select multiple images
                </p>

                {formState.pictures.length > 0 && (
                  <div className="new-post-pictures-section">
                    <h4 className="new-post-pictures-title">
                      Selected Pictures:
                    </h4>
                    <div className="new-post-pictures-grid">
                      {formState.pictures.map((file, index) => (
                        <div key={index} className="new-post-picture-preview">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="new-post-picture-image"
                          />
                          <button
                            type="button"
                            onClick={() => removePicture(index)}
                            className="x-btn"
                          >
                            ×
                          </button>
                          <p className="new-post-picture-filename">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {submitError && (
                <div className="error-message">{submitError}</div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating new post ..." : "Create Post"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewPostModal;
