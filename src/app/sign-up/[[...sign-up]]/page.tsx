import { SignUp } from "@clerk/nextjs"
import { SmokeyBackground } from "@/components/ui/smokey-background"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function SignUpPage() {
  return (
    <main className="relative min-h-screen bg-black">
      <SmokeyBackground color="#b45309" className="absolute inset-0" />
      
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-amber-500" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">smartDigitalNotes</span>
            </Link>
            <Link 
              href="/sign-in" 
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Already have an account? <span className="text-amber-400 font-semibold">Sign In</span>
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-20">
        <div className="w-full max-w-md">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-300",
                socialButtonsBlockButton: "bg-white/90 hover:bg-white text-gray-700 border-0",
                socialButtonsBlockButtonText: "font-semibold",
                dividerLine: "bg-gray-600",
                dividerText: "text-gray-400",
                formFieldLabel: "text-gray-300",
                formFieldInput: "bg-transparent border-gray-600 text-white focus:border-amber-500 focus:ring-amber-500",
                formButtonPrimary: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                footerActionLink: "text-amber-400 hover:text-amber-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-amber-400",
                formFieldInputShowPasswordButton: "text-gray-400",
                otpCodeFieldInput: "border-gray-600 text-white",
                formResendCodeLink: "text-amber-400",
                footer: "hidden"
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton"
              }
            }}
          />
        </div>
      </div>
    </main>
  )
}
