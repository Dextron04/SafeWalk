import React, { useState } from 'react';

export default function Feedback() {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Later: send this to backend or email service
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">📝 Feedback & Suggestions</h1>
        <p className="text-gray-400 mb-4">
          Got an idea or noticed something that can be improved? Help us build a better SafeWalk by sharing your thoughts!
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="6"
              placeholder="Type your feedback here..."
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow"
            >
              📤 Submit
            </button>
          </form>
        ) : (
          <div className="text-green-400 font-semibold mt-6">
            ✅ Thank you for your feedback! We appreciate your input.
          </div>
        )}
      </div>
    </div>
  );
}
