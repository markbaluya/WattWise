# AI DISCLOSURE & PROMPT AUDIT LOG

**Course:** ITMSD1 – Introduction to Mobile Design and Tools  
**Academic Year:** 1st Semester, 2026–2027  
**Participating Class:** Section C

## 1. Project Information

| Field | Details |
|---|---|
| Project Title | WattWise – Smart Electricity Consumption and Bill Estimator |
| UN SDG Track | SDG 7 – Affordable and Clean Energy |
| Team ID | C-10 |
| Team Name | H4CKERz |
| Team Members | Mark Kevin Baluya, Russel Torocoton, Junerex Conte |

## 2. AI Tools Used

The team used ChatGPT, OpenCode, and Kilo Code as development assistance tools while creating and improving the WattWise application. These tools assisted with planning, code implementation, troubleshooting, interface improvements, and security-related tasks.

### A. ChatGPT

**Purpose:** Development planning, coding assistance, troubleshooting, and preparing instructions for improving the WattWise application.

**Development activities:**
- Discussing the application's features and development requirements.
- Preparing and improving development instructions for the existing WattWise application.
- Getting coding guidance and troubleshooting assistance for the Expo React Native project.
- Reviewing application functionality and identifying possible improvements.
- Preparing instructions for AI coding agents to implement requested features.

**Prompt record:** Summary of development-related interactions. The exact original prompts and dates are not available in the collected conversation exports.

### B. OpenCode

**Purpose:** Implementing and improving WattWise application features using the existing Expo React Native project.

**1. Figma Design to Expo Application**

**Date:** November 12, 2026

**Prompt summary:** Asked OpenCode to implement the WattWise Figma design in the existing Expo application.

**Work involved:**
- Inspecting the existing project structure.
- Translating the approved design into application screens.
- Working with the existing navigation, components, and theme.
- Improving the application interface while preserving existing functionality.

**2. WattWise User Interface Improvements**

**Date:** Not confirmed in the available export.

**Prompt summary:** Requested improvements to the existing WattWise application while preserving its current screens, Gemini integration, authentication, and navigation.

**Work involved:**
- Improving existing screens and interface components.
- Following the approved Figma design as a visual reference.
- Maintaining the existing application structure.
- Avoiding unnecessary changes to unrelated features.

**3. Gemini AI Chatbot Integration**

**Date:** Not confirmed in the available export.

**Development activities:**
- Connecting the chatbot to a Gemini-powered backend.
- Implementing an Express API endpoint for chatbot requests.
- Moving the Gemini API key to server-side environment configuration.
- Sending conversation history and application data to the backend.
- Adding error handling and fallback responses.

**4. Profile and Settings Improvements**

**Date:** Not confirmed in the available export.

**Development activities:**
- Implementing Edit Profile and Change Password screens.
- Adding Electricity Rate and Monthly Budget settings.
- Adding Calculation Period settings.
- Supporting Dark, Light, and System themes.
- Improving navigation and saving settings.

**5. Bill Calculation and Bill History**

**Date:** Not confirmed in the available export.

**Prompt summary:** Requested improvements to make the bill calculation and bill history features functional in the WattWise Expo application.

**Development activities:**
- Improving electricity bill calculation functionality.
- Working on bill history features.
- Improving the presentation of electricity consumption and billing information.

**Note:** The complete original prompt and implementation details were not available in the collected excerpt.

### C. Kilo Code

**Purpose:** Implementing new features, improving the dashboard, and strengthening application security.

**Date:** November 15, 2026

**1. AI Chatbot Conversation History and Dashboard Gradient Button**

**Prompt summary:** Requested two improvements to the existing WattWise Expo React Native application without rebuilding it.

**Work involved:**
- Adding a Recent Conversations section.
- Automatically saving user messages and AI responses.
- Allowing users to reopen and continue previous conversations.
- Adding New Chat functionality.
- Adding Rename and Delete options for conversations.
- Using AsyncStorage for persistent conversation storage.
- Updating the Dashboard Calculate Bill button with a green-to-cyan-to-blue gradient.

**Reported result:** The conversation history and gradient button were implemented. TypeScript checks, ESLint, and Expo web bundling passed.

**2. Administrator Authentication Security Audit**

**Prompt summary:** Requested a security audit of the WattWise application before publishing it to GitHub.

**Work involved:**
- Inspecting administrator authentication and password storage.
- Scanning for exposed passwords, API keys, and other secrets.
- Checking backend and application security.
- Reviewing dependency vulnerabilities.
- Fixing `.gitignore` and backend security issues.
- Identifying risks involving client-side authentication and password storage.

**3. Backend Authentication Implementation**

**Prompt summary:** After reviewing the security audit findings, approved the implementation of full backend authentication.

**Work involved:**
- Implementing backend administrator authentication.
- Using bcrypt for password hashing.
- Using Expo SecureStore for session credentials.
- Adding login, logout, and administrator account endpoints.
- Protecting chatbot and account endpoints.
- Adding login rate limiting and input validation.
- Removing the hardcoded administrator password from the frontend source code.

**Reported result:** Backend authentication was implemented and several authentication and security tests passed. Some remaining risks and dependency advisories were documented.

## 3. Weekly Development Timeline

| Week | Date | Development Activities |
|---|---|---|
| Week 1 | October 16, 2026 | Initial WattWise project planning, feature discussions, and development preparation with AI assistance. The team discussed the project's objectives and planned application features. |
| Week 2 | November 11, 2026 | Continued WattWise development, including application improvements, interface planning, and preparation for implementation using AI development assistance. |
| Week 3 | November 12, 2026 | Used OpenCode to translate the approved WattWise Figma design into the existing Expo React Native application. Worked on application screens, navigation, components, and theme improvements. |
| Week 4 | November 14–15, 2026 | Used AI development tools to improve chatbot conversation history, dashboard UI, and administrator authentication. Implemented conversation saving, reopening, renaming, and deletion, improved the Dashboard Calculate Bill button, and conducted security improvements. |

## 4. AI Usage and Human Responsibility

AI tools were used as development assistants. The team remained responsible for reviewing the generated code, checking application functionality, making development decisions, and evaluating whether the implemented features met the project requirements.

AI-generated suggestions and code were not automatically considered correct. Testing and reviewing were necessary to identify errors and ensure that the existing WattWise application continued to work.

The team also made decisions about which AI-generated suggestions to accept, modify, or reject based on the application's requirements.

## 5. Disclosure Notes

- ChatGPT, OpenCode, and Kilo Code were used for WattWise-related development assistance.
- Gemini API was used as the AI service integrated into the WattWise chatbot.
- OpenCode and Kilo Code assisted with implementation and code improvements.
- Some prompt descriptions in this document are summaries because the complete original conversation exports were not available.
- Dates that could not be confirmed are not presented as exact dates in the individual AI tool records.
- No unrelated conversations, AI-agent installation instructions, or connection troubleshooting activities are included.
- Reported implementation and testing results are based on the available AI conversation records.

## 6. Team Acknowledgment

We acknowledge the use of AI tools in assisting with the development of WattWise. The team understands that AI is a support tool and that the responsibility for the final application, its functionality, and its submitted work remains with the team.

**Team Members:**

1. Mark Kevin Baluya
2. Russel Torocoton
3. Junerex Conte
