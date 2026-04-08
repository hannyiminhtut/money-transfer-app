export default function ErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                <p className="text-gray-600 mb-6">Sorry, we encountered an expected error during authentication.</p>
                <a href="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Return to Login
                </a>
            </div>
        </div>
    );
}
