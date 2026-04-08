import { login } from './actions';

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Transfer System</h1>
                    <p className="text-blue-100">Sign in to manage records</p>
                </div>

                <div className="p-8">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50"
                                placeholder="••••••••"
                            />
                        </div>

                        {searchParams.error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                {searchParams.error}
                            </div>
                        )}

                        <button
                            formAction={login}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
