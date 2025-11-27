// src/components/StudentRegistrationForm.jsx
import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

function Toast({ id, type = "success", message, onClose }) {
  // simple toast UI
  const bg = type === "success" ? "bg-emerald-600" : "bg-rose-600";
  return (
    <div
      className={`pointer-events-auto max-w-sm w-full ${bg} text-white shadow-lg rounded-md p-3 mb-3 animate-slide-in`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {type === "success" ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="flex-1 text-sm leading-tight">{message}</div>

        <button onClick={() => onClose(id)} className="text-white opacity-90 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  );
}

export default function StudentRegistrationForm() {
  const initial = {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    course: "",
    address: "",
  };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  // image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");

  // theme
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("pref-theme") === "dark";
    } catch {
      return false;
    }
  });

  // toasts
  const [toasts, setToasts] = useState([]);

  // refs
  const submittedRef = useRef(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    // apply dark class to document root
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("pref-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("pref-theme", "light");
    }
  }, [isDark]);

  function pushToast({ type = "success", message }) {
    const id = Date.now().toString();
    setToasts((t) => [...t, { id, type, message }]);
    // auto remove in 5s
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5000);
  }

  function removeToast(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const err = {};
    if (!form.fullName.trim()) err.fullName = "Full name is required";
    if (!form.email) err.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      err.email = "Enter a valid email";
    if (!form.phone) err.phone = "Phone is required";
    else if (!/^[0-9]{7,15}$/.test(form.phone))
      err.phone = "Phone must be 7–15 digits";
    if (!form.dob) err.dob = "Date of birth is required";
    if (!form.gender) err.gender = "Please select gender";
    if (!form.course) err.course = "Please select course";
    return err;
  }

  function handleImageChange(e) {
    setImageError("");
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload an image file (jpg, png, webp).");
      pushToast({ type: "error", message: "Invalid file type. Please upload an image." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image too large. Max 2MB.");
      pushToast({ type: "error", message: "Image too large. Maximum 2MB allowed." });
      return;
    }
    setImageFile(file);
    pushToast({ type: "success", message: "Image selected" });
  }

  function removeImage() {
    setImageFile(null);
    setImageError("");
    pushToast({ type: "success", message: "Image removed" });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length === 0) {
      const payload = {
        ...form,
        photoName: imageFile ? imageFile.name : null,
        submittedAt: new Date().toLocaleString(),
      };
      setSubmitted(payload);
      pushToast({ type: "success", message: "Registration successful" });

      // clear but keep preview for submitted view
      setForm(initial);
      setErrors({});
      setImageFile(null);
    } else {
      pushToast({ type: "error", message: "Please fix the validation errors" });
    }
  }

  // PDF export: capture submittedRef element to PDF
  async function exportPDF() {
    if (!submittedRef.current) {
      pushToast({ type: "error", message: "Nothing to export" });
      return;
    }
    try {
      // make a clone of the node to ensure styles & layout stable
      const node = submittedRef.current;
      // set scale for high-quality pdf
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`student_${submitted?.fullName ? submitted.fullName.replace(/\s+/g, "_") : "export"}.pdf`);
      pushToast({ type: "success", message: "PDF downloaded" });
    } catch (err) {
      console.error("PDF export error:", err);
      pushToast({ type: "error", message: "PDF export failed" });
    }
  }

  // small Label with required star
  const Label = ({ children, required = false, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      <span className="inline-flex items-center">
        {children}
        {required && <span className="ml-1 text-rose-600 leading-none" aria-hidden>*</span>}
      </span>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Toast container top-right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header with dark toggle */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Student Registration</h1>

          {/* <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsDark((d) => !d);
                pushToast({ type: "success", message: isDark ? "Light mode" : "Dark mode" });
              }}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 hover:scale-105 transform transition"
              aria-pressed={isDark}
              aria-label="Toggle dark mode"
            >
              {isDark ? "Dark" : "Light"}
            </button>
          </div> */}
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 transition-all">
          <div className="p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Photo */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 shadow-inner flex items-center justify-center transition-transform transform hover:scale-105">
                    {imagePreview ? (
                      <img src={imagePreview} alt="profile preview" className="w-36 h-36 object-cover rounded-full border-4 border-white shadow-lg" />
                    ) : (
                      <div className="text-amber-700 text-center p-3">
                        <svg className="w-12 h-12 mx-auto mb-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553 2.276A2 2 0 0120 14.118V18a2 2 0 01-2 2H6a2 2 0 01-2-2v-3.882a2 2 0 01.447-1.843L9 10l3-4 3 4z"></path>
                        </svg>
                        <div className="text-xs text-amber-700 font-medium">Profile Photo</div>
                      </div>
                    )}

                    {imagePreview && (
                      <button onClick={removeImage} type="button" className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow hover:scale-105 transition" title="Remove photo">
                        <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </button>
                    )}
                  </div>

                  <label htmlFor="photo" className="mt-4 w-full inline-flex items-center justify-center rounded-md border-2 border-dashed border-amber-200 px-3 py-2 text-sm text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition cursor-pointer dark:bg-slate-700 dark:border-slate-600">
                    <input id="photo" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0-6l-3 3m3-3l3 3M8 7h8" />
                    </svg>
                    <span className="font-medium">Upload Photo</span>
                  </label>

                  {imageError && <p className="text-xs text-rose-600 mt-2">{imageError}</p>}
                  <p className="text-xs text-slate-500 mt-2 text-center dark:text-slate-300">PNG/JPG/WebP • max 2MB</p>
                </div>

                {/* Inputs */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" required>Full Name</Label>
                      <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} aria-required className={`mt-2 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:outline-none transition ${errors.fullName ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-amber-200"}`} />
                      {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email" required>Email</Label>
                      <input id="email" type="email" name="email" value={form.email} onChange={handleChange} aria-required className={`mt-2 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:outline-none transition ${errors.email ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-amber-200"}`} />
                      {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone" required>Phone</Label>
                      <input id="phone" name="phone" value={form.phone} onChange={handleChange} aria-required className={`mt-2 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:outline-none transition ${errors.phone ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-amber-200"}`} />
                      {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <Label htmlFor="dob" required>Date of Birth</Label>
                      <input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} aria-required className={`mt-2 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:outline-none transition ${errors.dob ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-amber-200"}`} />
                      {errors.dob && <p className="text-xs text-rose-600 mt-1">{errors.dob}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="gender" required>Gender</Label>
                      <select id="gender" name="gender" value={form.gender} onChange={handleChange} aria-required className={`mt-2 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:outline-none transition ${errors.gender ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-amber-200"}`}>
                        <option value="">Select...</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && <p className="text-xs text-rose-600 mt-1">{errors.gender}</p>}
                    </div>

                    <div>
                      <Label htmlFor="course" required>Course</Label>
                      <select id="course" name="course" value={form.course} onChange={handleChange} aria-required className={`mt-2 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:outline-none transition ${errors.course ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-amber-200"}`}>
                        <option value="">Select Course</option>
                        <option value="bca">BCA</option>
                        <option value="bsc">BSc</option>
                        <option value="mba">MBA</option>
                        <option value="diploma">Diploma</option>
                      </select>
                      {errors.course && <p className="text-xs text-rose-600 mt-1">{errors.course}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="address">Address</Label>
                    <textarea id="address" name="address" rows="3" value={form.address} onChange={handleChange} placeholder="Street, City, State" className="mt-2 block w-full rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:outline-none focus:ring-amber-200 transition" />
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button type="submit" className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md shadow-md transform transition hover:-translate-y-0.5 active:translate-y-0.5 duration-200">
                      Register
                    </button>

                    <button type="button" onClick={() => { setForm(initial); setErrors({}); setSubmitted(null); setImageFile(null); setImageError(""); pushToast({ type: "success", message: "Form reset" }); }} className="flex-1 sm:flex-none px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      Reset
                    </button>

                    {submitted && (
                      <button type="button" onClick={exportPDF} className="ml-auto px-4 py-2 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white rounded-md hover:opacity-95 transition">
                        Download PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Submitted panel (captured for PDF) */}
          <div className={`transition-all duration-300 ease-out overflow-hidden ${submitted ? "max-h-96" : "max-h-0"}`} aria-live="polite">
            {submitted && (
              <div ref={submittedRef} className="border-t bg-amber-50 dark:bg-slate-700 p-4 sm:p-6 flex items-start gap-4 animate-slide-in">
                <div className="text-amber-700 dark:text-amber-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-amber-800 dark:text-amber-300">Registration successful</div>
                  <div className="text-sm text-amber-700 dark:text-amber-200 mt-1">Saved at: {submitted.submittedAt}</div>

                  <div className="mt-3 flex gap-4 items-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="submitted photo" className="w-16 h-16 rounded-full object-cover border border-white shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-medium">No Photo</div>
                    )}

                    <div>
                      <div className="text-sm text-slate-700 dark:text-slate-100 font-medium">{submitted.fullName || "—"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-200">{submitted.email || "—"}</div>
                    </div>
                  </div>

                  <pre className="mt-3 text-xs text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-800 p-3 rounded-md overflow-auto border border-slate-100 dark:border-slate-700">
                    {JSON.stringify(submitted, null, 2)}
                  </pre>
                </div>

                <div>
                  <button onClick={() => setSubmitted(null)} className="text-sm text-amber-700 dark:text-amber-300 hover:underline">Dismiss</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Tip: connect this form to a backend to persist registrations.
        </div>
      </div>
    </div>
  );
}