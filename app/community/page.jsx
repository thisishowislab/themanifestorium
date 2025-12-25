// app/community/page.jsx
import Link from "next/link";

export default function CommunityPage({ searchParams }) {
  const item = searchParams?.item ? decodeURIComponent(searchParams.item) : null;

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Community Supported Creations
          </h1>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400 text-gray-200"
          >
            Back Home
          </Link>
        </div>

        <div className="p-8 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/30">
          <p className="text-gray-300 leading-relaxed">
            Not everything here is meant to be bought with cash.
            Community Supported Creations exists for people who want to participate but can’t—or don’t want to—engage purely through money.
          </p>

          <p className="text-gray-300 leading-relaxed mt-4">
            This can include skill exchange, material trade, collaborative work, or partial payment combined with contribution.
            The goal isn’t “free stuff.” The goal is keeping creation accessible, relational, and human.
          </p>

          {item && (
            <div className="mt-6 p-4 rounded-xl border border-purple-500/30 bg-black/40">
              <p className="text-sm text-gray-300">
                You’re asking about: <span className="text-cyan-300 font-semibold">{item}</span>
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Include what you can offer (skills/materials/time) and what you’re hoping for, and we’ll figure out what makes sense.
              </p>
            </div>
          )}

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-cyan-500/30 bg-black/30">
              <h2 className="text-xl font-bold text-cyan-300 mb-3">Examples of contributions</h2>
              <ul className="text-gray-300 space-y-2">
                <li>• Materials: filament, resin, hardware, LEDs, salvage parts</li>
                <li>• Skills: design help, welding, photography, editing, web work</li>
                <li>• Time: build assistance, setup help, event support</li>
                <li>• Partial payment + contribution</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-purple-500/30 bg-black/30">
              <h2 className="text-xl font-bold text-purple-300 mb-3">Ground rules</h2>
              <ul className="text-gray-300 space-y-2">
                <li>• Respect and clarity are required</li>
                <li>• Not every request will be a fit</li>
                <li>• We agree on terms before anything starts</li>
                <li>• Good faith only — no weird pressure tactics</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={item
                ? `mailto:thisishowislab@gmail.com?subject=${encodeURIComponent("Community Options — " + item)}&body=${encodeURIComponent(
                    "Hi! I’m interested in Community Supported Creations for: " + item + "\n\nWhat I can offer:\n- \n\nWhat I’m hoping for:\n- \n\nTimeline / notes:\n- "
                  )}`
                : `mailto:thisishowislab@gmail.com?subject=${encodeURIComponent("Community Options")}&body=${encodeURIComponent(
                    "Hi! I’m interested in Community Supported Creations.\n\nWhat I can offer:\n- \n\nWhat I’m hoping for:\n- \n\nTimeline / notes:\n- "
                  )}`
              }
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30 text-center"
            >
              Start a Conversation
            </a>

            <Link
              href="/"
              className="px-8 py-4 border-2 border-cyan-400 rounded-lg font-bold text-lg hover:bg-cyan-400/20 transition-all text-center"
            >
              Return to Site
            </Link>
          </div>

          <p className="text-gray-400 text-sm mt-6">
            This is not a discount program. It’s a relationship-based exchange model.
          </p>
        </div>
      </div>
    </div>
  );
}
