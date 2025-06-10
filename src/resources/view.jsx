import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/appContext";

export default function View() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AppContext);

    const [resource, setResource] = useState(null);
    // New state variables for booking form
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [bookingType, setBookingType] = useState(""); // New state for booking type
    const [priority, setPriority] = useState(""); 
    const [bookingMessage, setBookingMessage] = useState(""); // For success/error messages
    const [validationErrors, setValidationErrors] = useState({}); // New state for backend validation errors

    async function getResource() {
        const res = await fetch(`/api/resources/${id}`, {
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();

        if (res.ok) {
            // Adjust based on your resource API response structure
            if (data.resource) {
                setResource(data.resource);
            } else if (data.data) {
                setResource(data.data);
            } else {
                setResource(data);
            }
        } else {
            console.error("Failed to fetch resource:", data);
            setResource(null);
            setBookingMessage("Failed to load resource details.");
        }
    }

   // Improved Frontend Booking Handler
async function handleSubmitBooking(e) {
    e.preventDefault();
    setBookingMessage("");
    setValidationErrors({});

    console.log('🔍 Booking submission started');

    // Enhanced validation
    if (!user) {
        setBookingMessage("You must be logged in to book a resource.");
        return;
    }

    if (!token) {
        setBookingMessage("Authentication required. Please log in again.");
        return;
    }

    if (!resource) {
        setBookingMessage("Resource data not loaded yet.");
        return;
    }

    // Enhanced client-side validation
    if (!startTime || !endTime || !purpose) {
        setBookingMessage("Please fill in all booking details (Start Time, End Time, Purpose).");
        return;
    }

    // Validate purpose length
    const trimmedPurpose = purpose.trim();
    if (trimmedPurpose.length < 10) {
        setBookingMessage("Purpose must be at least 10 characters long.");
        return;
    }

    if (trimmedPurpose.length > 500) {
        setBookingMessage("Purpose cannot exceed 500 characters.");
        return;
    }

    // Enhanced date validation with proper formatting
    let startDate, endDate;
    try {
        startDate = new Date(startTime);
        endDate = new Date(endTime);

        // Check for invalid dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            setBookingMessage("Invalid date format. Please check your date inputs.");
            return;
        }

        // Time validations
        if (startDate >= endDate) {
            setBookingMessage("End time must be after start time.");
            return;
        }

        if (startDate <= new Date()) {
            setBookingMessage("Start time must be in the future.");
            return;
        }

        // Check if booking is too far in advance (optional - 3 months limit)
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        if (startDate > threeMonthsFromNow) {
            setBookingMessage("Bookings cannot be made more than 3 months in advance.");
            return;
        }

    } catch (error) {
        console.error('Date parsing error:', error);
        setBookingMessage("Invalid date format. Please check your date inputs.");
        return;
    }

    // Prepare booking data with consistent ISO format
    const bookingData = {
        resource_id: resource.id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        purpose: trimmedPurpose,
        user_type: bookingType, // Use bookingType if set, otherwise default to user's type
    };

    // Include priority if user is admin and priority is set
    if (user?.user_type === 'admin' && priority && priority.trim() !== '') {
        const priorityNum = parseInt(priority, 10);
        if (!isNaN(priorityNum) && priorityNum >= 1 && priorityNum <= 5) {
            bookingData.priority = priorityNum;
        } else {
            setBookingMessage("Priority must be a number between 1 and 5.");
            return;
        }
    }

    console.log('📤 Sending booking data:', bookingData);
    console.log('📤 Exact JSON being sent:', JSON.stringify(bookingData, null, 2));

    // Show loading state
    setBookingMessage("Submitting booking request...");

    try {
        const requestOptions = {
            method: "POST",
            headers: {
                // "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(bookingData)
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const res = await fetch("/api/bookings", {
            ...requestOptions,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        console.log('📥 Response status:', res.status);
        console.log('📥 Response headers:', Object.fromEntries(res.headers.entries()));

        let data;
        const contentType = res.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            // Handle non-JSON responses
            const textResponse = await res.text();
            console.error('Non-JSON response received:', textResponse);
            
            // Check if it's an authentication redirect (common cause)
            if (res.status === 302 || textResponse.includes('login')) {
                setBookingMessage("Your session has expired. Please log in again.");
                return;
            }
            
            setBookingMessage("Server returned an unexpected response format. Please try again.");
            return;
        }

        console.log('📥 Response data:', data);

        if (res.ok) {
            // Handle successful booking
            let successMsg = data.message || "Booking request submitted successfully!";
            
            if (data.preempted_bookings && data.preempted_bookings.length > 0) {
                successMsg += ` ${data.preempted_bookings.length} existing booking(s) were preempted by this higher priority booking.`;
            }
            
            console.log('✅ Booking successful:', successMsg);
            setBookingMessage(successMsg);
            
            // Clear form fields on success
            setStartTime("");
            setEndTime("");
            setPurpose("");
            setPriority("");
            
            // Optional: Refresh bookings list or navigate away
            // if (onBookingSuccess) onBookingSuccess(data.booking);
            
        } else {
            // Handle different types of errors
            console.error('❌ Booking failed with status:', res.status);
            console.error('❌ Error data:', data);

            switch (res.status) {
                case 401:
                    setBookingMessage("Your session has expired. Please log in again.");
                    // Optional: Trigger logout or redirect to login
                    break;
                    
                case 403:
                    setBookingMessage("You don't have permission to perform this action.");
                    break;
                    
                case 422:
                    // Validation errors
                    if (data.errors) {
                        console.log('📝 Validation errors:', data.errors);
                        setValidationErrors(data.errors);
                        
                        // Create a user-friendly error message
                        const errorMessages = Object.values(data.errors).flat();
                        setBookingMessage(`Please correct the following errors: ${errorMessages.join(', ')}`);
                    } else {
                        setBookingMessage(data.message || "Please correct the errors in your booking details.");
                    }
                    break;
                    
                case 409:
                    // Conflict errors
                    if (data.conflicting_bookings && data.conflicting_bookings.length > 0) {
                        const conflictDetails = data.conflicting_bookings
                            .map(conflict => `${conflict.user} (${conflict.start_time} - ${conflict.end_time})`)
                            .join(', ');
                        setBookingMessage(`${data.message || 'Resource conflict detected.'} Conflicting bookings: ${conflictDetails}`);
                    } else {
                        setBookingMessage(data.message || 'Resource conflict detected.');
                    }
                    break;
                    
                case 429:
                    // Rate limiting
                    setBookingMessage(data.message || 'You have too many active bookings. Please cancel some existing bookings first.');
                    break;
                    
                case 500:
                    // Server error
                    let errorMsg = 'A server error occurred. Please try again later.';
                    if (data.debug_error && process.env.NODE_ENV === 'development') {
                        errorMsg += ` Debug: ${data.debug_error}`;
                    }
                    console.error('🔥 Server error details:', data);
                    setBookingMessage(errorMsg);
                    break;
                    
                default:
                    setBookingMessage(data.message || `Request failed with status ${res.status}. Please try again.`);
            }
        }
        
    } catch (error) {
        console.error("🌐 Network or fetch error:", error);
        console.error("🌐 Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Handle different error types
        if (error.name === 'AbortError') {
            setBookingMessage("Request timed out. Please check your internet connection and try again.");
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            setBookingMessage("Network error. Please check your internet connection and try again.");
        } else if (error.name === 'SyntaxError') {
            setBookingMessage("Server returned invalid data. Please try again.");
        } else {
            setBookingMessage(`An unexpected error occurred: ${error.message}. Please try again.`);
        }
    }
}

    async function handleDelete(e) {
        e.preventDefault();

        if (!resource) {
            console.warn("Resource data not loaded yet for deletion attempt.");
            return;
        }

        // Ensure user is authorized for deletion (e.g., resource owner or admin)
        // This check should primarily be done on the backend, but a frontend check provides immediate feedback.
        if (user && (user.id === resource.user_id || user.user_type === 'admin')) { // Added admin check
            const res = await fetch(`/api/resources/${id}`, {
                method: "delete",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                navigate("/"); // Redirect on successful deletion
            } else {
                console.error("Failed to delete resource:", data);
                // Provide feedback to user if deletion fails
                setBookingMessage(`Failed to delete resource: ${data.message || 'Unknown error'}`);
            }
        } else {
            console.warn("User not authorized to delete this resource.");
            setBookingMessage("You are not authorized to delete this resource.");
        }
    }


    useEffect(() => {
        getResource();
    }, [id, token]); // Re-run when id or token changes

    // Helper to format validation error messages
    const displayError = (field) => {
        if (validationErrors[field]) {
            return <p className="error-message">{validationErrors[field][0]}</p>;
        }
        return null;
    };

    return (
        <>
            <div className="single-resource-container">
                {resource ? (
                    <div key={resource.id} className="single-resource-card">
                        <h2 className="single-resource-title">{resource.name}</h2>
                        <p className="single-resource-detail"><strong>Description:</strong> {resource.description}</p>
                        <p className="single-resource-detail"><strong>Location:</strong> {resource.location}</p>
                        <p className="single-resource-detail"><strong>Capacity:</strong> {resource.capacity}</p>
                        {/* Use resource.is_active if your resource fetch returns it explicitly */}
                        {/* Otherwise, the status field might indicate availability or not */}
                        <span className="">
                            Availability status: <span className={resource.is_active ? 'status-available' : 'status-booked'}>
                                {resource.is_active ? 'Available' : 'Unavailable'}
                            </span>
                        </span>
                        
                        {/* Display delete button only if user is authorized */}
                        {(user && (user.id === resource.user_id || user.user_type === 'admin')) && (
                            <div className="action-buttons">
                                <Link to={`/resources/edit/${resource.id}`} className="action-button edit-button">Edit Resource</Link>
                                <button onClick={handleDelete} className="action-button delete-button">Delete Resource</button>
                            </div>
                        )}

                        {user ? ( // Only show booking form if user is logged in
                            <div className="booking-form-section">
                                <h3>Book this Resource</h3>
                                <form onSubmit={handleSubmitBooking} className="booking-form">
                                    <div className="form-group">
                                        <label htmlFor="startTime">Start Time:</label>
                                        <input
                                            type="datetime-local"
                                            id="startTime"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            required
                                            className="form-input"
                                        />
                                        {displayError('start_time')}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="endTime">End Time:</label>
                                        <input
                                            type="datetime-local"
                                            id="endTime"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            required
                                            className="form-input"
                                        />
                                        {displayError('end_time')}
                                    </div>
                                    <div className='form-details'>
                                        <select
                                            name="user_type"
                                            id="user_type"
                                            className={`input ${errors.user_type ? 'input-error' : ''}`}
                                            value={formData.user_type}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">-------------------Booking type---------------------</option>
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="guest">Guest</option>
                                        </select>
                                        {errors.user_type && <span className="error">{errors.user_type}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="purpose">Purpose of Booking:</label>
                                        <textarea
                                            id="purpose"
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            rows="4"
                                            required
                                            className="form-textarea"
                                        ></textarea>
                                        {displayError('purpose')}
                                    </div>

                                    {/* Admin-only Priority Input */}
                                    {user.user_type === 'admin' && (
                                        <div className="form-group">
                                            <label htmlFor="priority">Priority (1=Critical, 4=Low):</label>
                                            <input
                                                type="number"
                                                id="priority"
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                min="1"
                                                max="4" // Match your backend Enum values
                                                className="form-input"
                                                placeholder="e.g., 1 for Critical"
                                            />
                                            {displayError('priority')}
                                        </div>
                                    )}

                                    <button type="submit" className="action-button book-button">
                                        Submit Booking
                                    </button>
                                </form>
                                {bookingMessage && <p className="booking-message">{bookingMessage}</p>}
                            </div>
                        ) : (
                            <p className="login-prompt-message">Please <Link to="/login">log in</Link> to book this resource.</p>
                        )}
                    </div>
                ) : (
                    <p className="resource-not-found-message">Loading resource or resource not found!</p>
                )}
            </div>
        </>
    );
}