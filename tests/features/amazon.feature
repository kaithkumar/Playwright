Feature: Amazon Product Search
  As a customer I want to search for APACS badminton rackets
  And view their model, weight, and price information

  Scenario: Search for APACS highend rackets on Amazon
    Given I open Amazon homepage
    When I search for "apacs highend rackets"
    Then I should see search results
    And I should extract and display product details
    And I should display product weight and specifications
