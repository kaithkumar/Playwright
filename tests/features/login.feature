Feature: Login
  As a user I want to log in to Practice Test Automation

  Scenario: Successful login
    Given I am on the login page
    When I login with username "student" and password "Password123"
    Then I should see the logged in page and save a screenshot
