import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Step 1: Navigate to the app
        # We are guessing the port. Common Expo web ports are 19006 and 8081.
        page.goto("http://localhost:8081", timeout=60000)

        # Step 2: Wait for the main page to load
        # Let's look for a known text on the page.
        expect(page.get_by_text("Select an agent to get started")).to_be_visible(timeout=30000)
        print("App loaded successfully.")

        # Step 3: Click on the "Code Executor" agent
        # The agent is likely in a clickable card. We'll find it by the text it contains.
        code_executor_card = page.get_by_text("Code Executor", exact=True).locator('xpath=./ancestor::*[contains(@class, "p-4")]')
        expect(code_executor_card).to_be_visible()
        code_executor_card.click()
        print("Clicked on Code Executor agent.")

        # Step 4: Type a message in the chat input
        # The input field likely has a placeholder.
        chat_input = page.get_by_placeholder("Type your message...")
        expect(chat_input).to_be_visible()
        chat_input.fill("calculate 2+2")
        print("Typed message into chat input.")

        # Step 5: Click the send button
        # The send button might be an icon, let's find it by its role.
        send_button = page.get_by_role("button").filter(has_text="Send") # Assuming it has text "Send" or similar
        if not send_button.is_visible():
            # Fallback to finding a button with a send icon
            send_button = page.locator('button[aria-label*="Send"]') # Generic send button

        # As a last resort, let's assume it is the only button next to the input
        if not send_button.is_visible():
            send_button = chat_input.locator('xpath=./following-sibling::button')

        expect(send_button).to_be_visible()
        send_button.click()
        print("Clicked send button.")

        # Step 6: Wait for the response and verify it
        # The response will be in a message bubble. We check for the success text.
        response_bubble = page.locator('.message-bubble-bot').last()
        expect(response_bubble).to_contain_text(re.compile("Successfully created sandbox", re.IGNORECASE), timeout=30000)
        print("Verified success message.")

        # Step 7: Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot taken.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
        raise

    finally:
        browser.close()

with sync_playwright() as p:
    run_verification(p)
