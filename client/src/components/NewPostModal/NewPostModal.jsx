import React from 'react';
import { useState } from 'react';

const NewPostModal = ({ isOpen, onClose, onSubmit }) => {
    const [formState, setFormState] = useState({
        city: "",
        state: "",
        content: ""
    })
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateFormField = (field, value) => {
        setFormState((prev) => ({
        ...prev,
        [field]: value,
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
                content: ""
            })

            onClose();
        } catch (error) {
            setSubmitError("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <>
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <span className="x-btn" onClick={onClose}>&times;</span>
                <div className="new-post-modal">
                    <h2>Create a New post</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
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
    )
}

export default NewPostModal;
