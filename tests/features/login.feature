Feature: Login
  As a user I want to log in to Practice Test Automation

  Scenario: Successful login
    Given I am on the login page
    When I login with username "student" and password "Password123"
    Then I should see the logged in page and save a screenshot

  Scenario: Positive LogIn test
    Given I am on the login page
    When I fill the username field with "student"
    And I fill the password field with "Password123"
    And I click the Submit button
    Then I should see the logged in page and save a screenshot

  Scenario: Negative username test
    Given I am on the login page
    When I fill the username field with "incorrectUser"
    And I fill the password field with "Password123"
    And I click the Submit button
    Then I should see error message "Your username is invalid!"
    And I should remain on the login page

  Scenario: Negative password test
    Given I am on the login page
    When I fill the username field with "student"
    And I fill the password field with "incorrectPassword"
    And I click the Submit button
    Then I should see error message "Your password is invalid!"
    And I should remain on the login page

  Scenario: Empty fields test
    Given I am on the login page
    When I clear all fields
    And I click the Submit button
    Then I should see error message "Your username is invalid!"
    And I should remain on the login page

  Scenario: Submit via Enter key in password field
    Given I am on the login page
    When I fill the username field with "student"
    And I fill the password field with "Password123"
    And I press Enter in the password field
    Then I should remain on the login page

  Scenario: Tab order and field labels (Accessibility)
    Given I am on the login page
    Then username field should have label "Username"
    And password field should have label "Password"

  Scenario: Logout button visibility on success
    Given I am on the login page
    When I login with username "student" and password "Password123"
    Then I should see the logout button

  Scenario: SQL injection attack prevention
    Given I am on the login page
    When I submit a SQL injection payload in username "' OR '1'='1"
    Then no SQL injection alert or error should appear
    And the page should still function normally after payload

  Scenario: XSS attack prevention in password
    Given I am on the login page
    When I submit an XSS payload in password "<script>alert('XSS')</script>"
    Then the password payload should not execute
    And the page should still function normally after payload

  Scenario: Back button safety after login
    Given I am on the login page
    When I navigate back from the logged-in page
    Then I should see the login page after back button
