import React, { useState, useEffect } from 'react';
import {
  Upload, X, Send, AlertCircle, CheckCircle, Phone, Mail, Clock, MapPin, Zap
} from 'lucide-react';
import useHelpStore from '../store/useHelpStore';

const Help = () => {
  const { submitHelpRequest, loading, error, successMessage, clearMessages } = useHelpStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  // Clear messages on component unmount
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Image validation
  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Only JPEG, PNG, GIF, and WebP images are allowed';
    }
    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }
    return null;
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (selectedImages.length + files.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'You can upload maximum 5 images'
      }));
      return;
    }

    const validFiles = [];
    const previews = [];
    let hasError = false;

    files.forEach(file => {
      const error = validateImage(file);
      if (error) {
        setErrors(prev => ({
          ...prev,
          images: error
        }));
        hasError = true;
      } else {
        validFiles.push(file);
        previews.push({
          file,
          url: URL.createObjectURL(file),
          name: file.name
        });
      }
    });

    if (!hasError) {
      setSelectedImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...previews]);
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  // Remove image
  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index].url);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await submitHelpRequest({
        ...formData,
        images: selectedImages
      });

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      setSelectedImages([]);
      setImagePreviews([]);
      setErrors({});
    } catch (error) {
      console.error('Failed to submit help request:', error);
    }
  };

  // Reset form handler
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    setSelectedImages([]);
    setImagePreviews([]);
    setErrors({});
    clearMessages();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ backgroundColor: '#293a90' }}>
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our support team is here to assist you. Describe your issue and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Contact Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(41, 58, 144, 0.1)' }}>
                    <Phone className="w-5 h-5" style={{ color: '#293a90' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+91 9118811192</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@webseeder.in</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Working Hours</p>
                    <p className="text-sm text-gray-600">Mon-Sat: 9AM - 6PM IST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">Indore, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-900">
                  Tips for faster resolution
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provide detailed description of the issue</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Attach relevant screenshots</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Include steps to reproduce the problem</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Mention browser/device information</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      placeholder="John Doe"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#293a90';
                        e.target.style.boxShadow = '0 0 0 3px rgba(41, 58, 144, 0.1)';
                      }}
                      onBlur={(e) => {
                        if (!errors.name) {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      placeholder="john@example.com"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#293a90';
                        e.target.style.boxShadow = '0 0 0 3px rgba(41, 58, 144, 0.1)';
                      }}
                      onBlur={(e) => {
                        if (!errors.email) {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Brief summary of your issue"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#293a90';
                      e.target.style.boxShadow = '0 0 0 3px rgba(41, 58, 144, 0.1)';
                    }}
                    onBlur={(e) => {
                      if (!errors.subject) {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  {errors.subject && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe your issue <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl transition-all resize-none ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Please provide as much detail as possible about your issue..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#293a90';
                      e.target.style.boxShadow = '0 0 0 3px rgba(41, 58, 144, 0.1)';
                    }}
                    onBlur={(e) => {
                      if (!errors.message) {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    {errors.message ? (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.message}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {formData.message.length}/500 characters (minimum 20)
                      </p>
                    )}
                  </div>
                </div>

                {/* Image Upload Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Attach Screenshots (Optional)
                  </label>

                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${errors.images ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
                    onMouseEnter={(e) => {
                      if (!errors.images) {
                        e.currentTarget.style.borderColor = '#293a90';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!errors.images) {
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }
                    }}
                  >
                    <input
                      type="file"
                      id="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(41, 58, 144, 0.1)' }}>
                          <Upload className="w-8 h-8" style={{ color: '#293a90' }} />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF or WebP (max. 5MB per image, up to 5 images)
                        </p>
                      </div>
                    </label>
                  </div>

                  {errors.images && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.images}
                    </p>
                  )}

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {preview.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Messages from Store */}
                {successMessage && (
                  <div className="p-4 rounded-xl flex items-start space-x-3 bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-xl flex items-start space-x-3 bg-red-50 border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center space-x-2 ${loading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    style={{ backgroundColor: '#293a90' }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
