import { SchemaField, TestCase, TestCaseResult } from '../types';

interface GenerationOptions {
  includeSteps: boolean;
  includeExpectedResult: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateTestCases = (schema: SchemaField[], options: GenerationOptions): TestCaseResult => {
  const result: TestCaseResult = {
    positive: [],
    negative: [],
    edge: [],
  };

  const addCase = (category: keyof TestCaseResult, field: string, title: string, steps: string, expectedResult: string) => {
    result[category].push({
      id: generateId(),
      field,
      title: `[${field}] ${title}`,
      steps: options.includeSteps ? steps : undefined,
      expectedResult: options.includeExpectedResult ? expectedResult : undefined,
    });
  };

  schema.forEach(({ name, type }) => {
    if (!name || name.trim() === '') return;

    switch (type) {
      case 'UUID':
        addCase('positive', name, 'Auto-generated unique value', 'Leave field blank or trigger auto-generate', 'System generates valid UUID v4');
        addCase('positive', name, 'Generate UUID via API call', 'Call the generation endpoint explicitly', 'API returns a properly formatted UUID');
        addCase('positive', name, 'Standard hyphenated format', 'Submit "550e8400-e29b-41d4-a716-446655440000"', 'System accepts correctly formatted UUID');
        addCase('positive', name, 'Uppercase UUID format', 'Submit "550E8400-E29B-41D4-A716-446655440000"', 'System accepts and standardizes to lowercase');
        addCase('negative', name, 'Duplicate UUID', 'Enter a UUID that already exists in DB', 'Validation error: UUID already exists');
        addCase('negative', name, 'Invalid UUID format', 'Enter "123-abc" instead of valid UUID', 'Validation error: Invalid UUID format');
        addCase('negative', name, 'Missing hyphens', 'Submit "550e8400e29b41d4a716446655440000"', 'Validation error: Missing hyphens');
        addCase('edge', name, 'Bulk uniqueness validation', 'Generate 1000 UUIDs rapidly', 'All 1000 UUIDs are strictly unique');
        addCase('edge', name, 'Concurrent UUID generation', 'Trigger 50 parallel requests', 'No collisions occur');
        addCase('edge', name, 'Nil UUID', 'Submit "00000000-0000-0000-0000-000000000000"', 'Rejected or handled based on system rules');
        break;
      
      case 'First Name':
      case 'Last Name':
      case 'Full Name':
      case 'Username':
        addCase('positive', name, 'Valid name with spaces', 'Enter typical alphabetic name', 'Value accepted successfully');
        addCase('positive', name, 'Name with hyphens/apostrophes', "Enter \"O'Connor\" or \"Anne-Marie\"", 'Special characters accepted');
        addCase('positive', name, 'Unicode characters', 'Enter "François" or "Müller"', 'Accents and unicode handled correctly');
        addCase('positive', name, 'Numeric inclusion (Username)', 'Enter "User123"', 'Accepted if numbers are allowed in names/usernames');
        addCase('negative', name, 'Empty, numeric, or special chars', 'Enter "!@#", or leave empty', 'Validation error: Invalid name format');
        addCase('negative', name, 'Extremely long name', 'Enter 500+ characters', 'Validation error: Exceeds maximum length');
        addCase('negative', name, 'Whitespace only', 'Enter "   "', 'Validation error: Cannot be empty');
        addCase('edge', name, 'Max length validation', 'Enter name with exactly 255 characters', 'Value accepted or gracefully truncated depending on spec');
        addCase('edge', name, 'Single character name', 'Enter "A" or "X"', 'Accepted if min length is 1, else rejected properly');
        addCase('edge', name, 'Trailing and leading spaces', 'Enter "  John Doe  "', 'System trims spaces before saving');
        break;

      case 'Email':
        addCase('positive', name, 'Valid standard email', 'Enter valid format like user@example.com', 'Email accepted');
        addCase('positive', name, 'Email with subdomains', 'Enter valid format like user@mail.example.co.uk', 'Email accepted');
        addCase('positive', name, 'Plus addressing', 'Enter "user+test@example.com"', 'Email accepted');
        addCase('positive', name, 'Numbers in local part', 'Enter "123user@example.com"', 'Email accepted');
        addCase('negative', name, 'Missing @ or domain', 'Enter "userexample.com" or "user@"', 'Validation error: Invalid email');
        addCase('negative', name, 'Missing username part', 'Enter "@example.com"', 'Validation error: Invalid email');
        addCase('negative', name, 'Spaces in email', 'Enter "user @example.com"', 'Validation error: Invalid email');
        addCase('edge', name, 'Max length email', 'Enter exactly 254 characters', 'Email accepted correctly');
        addCase('edge', name, 'Consecutive dots', 'Enter "user..name@example.com"', 'Validation error: Invalid email formatting');
        addCase('edge', name, 'IP domain email', 'Enter "user@[192.168.1.1]"', 'Accepted if IP domains are permitted');
        break;

      case 'Phone':
        addCase('positive', name, 'Valid 10-digit number', 'Enter 10 numeric digits', 'Phone accepted');
        addCase('positive', name, 'Phone with country code', 'Enter +1 555-0100', 'Phone accepted');
        addCase('positive', name, 'Spaces between blocks', 'Enter "123 456 7890"', 'Phone accepted and formatted');
        addCase('positive', name, 'Dashes between blocks', 'Enter "123-456-7890"', 'Phone accepted and formatted');
        addCase('negative', name, 'Alphabets included', 'Enter "abc1234567"', 'Validation error: Invalid phone format');
        addCase('negative', name, 'Too short', 'Enter "12345"', 'Validation error: Too short');
        addCase('negative', name, 'Special chars only', 'Enter "++--()"', 'Validation error: Invalid phone format');
        addCase('edge', name, 'Max bounds and country codes', 'Enter exactly 15 digits with country code', 'System handles exact bounds without overflow');
        addCase('edge', name, 'Padded with zeros', 'Enter "0000000000"', 'Validation fails or accepts based on strict locale rules');
        addCase('edge', name, 'Missing area code', 'Enter "555-1234"', 'Fails validation if 10-digits are strictly required');
        break;

      case 'Date (Past)':
        addCase('positive', name, 'Valid past date', 'Select a date from yesterday', 'Date accepted');
        addCase('positive', name, '10 years ago', 'Select a date 10 years in the past', 'Date accepted');
        addCase('positive', name, 'Last month', 'Select a date exactly one month ago', 'Date accepted');
        addCase('positive', name, 'Early 2000s', 'Select Jan 1, 2000', 'Date accepted');
        addCase('negative', name, 'Future date', "Select tomorrow's date", 'Validation error: Date must be in the past');
        addCase('negative', name, 'Invalid date string', 'Enter "not-a-date"', 'Validation error: Invalid date format');
        addCase('negative', name, 'Year 2099', 'Select "2099-01-01"', 'Validation error: Date must be in the past');
        addCase('edge', name, 'Leap year and exactly today', 'Select Feb 29 on leap year, or current datetime', 'Processed accurately based on strict bounds');
        addCase('edge', name, 'Oldest valid date limit', 'Select Jan 1, 1900', 'Processed accurately based on minimum date bounds');
        addCase('edge', name, 'One second ago', 'Select current datetime minus 1 second', 'Accepted successfully');
        break;

      case 'Date (Future)':
        addCase('positive', name, 'Valid future date', 'Select tomorrow', 'Date accepted');
        addCase('positive', name, '10 years in future', 'Select a date 10 years from today', 'Date accepted');
        addCase('positive', name, 'Next month', 'Select exactly one month from today', 'Date accepted');
        addCase('positive', name, 'Year 2050', 'Select Jan 1, 2050', 'Date accepted');
        addCase('negative', name, 'Past date', 'Select yesterday', 'Validation error: Date must be in the future');
        addCase('negative', name, 'Invalid date string', 'Enter "not-a-date"', 'Validation error: Invalid date format');
        addCase('negative', name, 'Year 1999', 'Select "1999-01-01"', 'Validation error: Date must be in the future');
        addCase('edge', name, 'Far future limit', 'Select Year 9999', 'Processed accurately without integer overflow');
        addCase('edge', name, 'Leap year future', 'Select Feb 29, 2028', 'Processed accurately');
        addCase('edge', name, 'One second from now', 'Select current datetime plus 1 second', 'Accepted successfully');
        break;

      case 'Number':
      case 'Price':
        addCase('positive', name, 'Valid numeric value', 'Enter standard number within range', 'Value accepted');
        addCase('positive', name, 'Decimal value', 'Enter 99.99', 'Value accepted');
        addCase('positive', name, 'Large number', 'Enter 1000000', 'Value accepted');
        addCase('positive', name, 'Zero', 'Enter 0', 'Accepted if zero is permitted by schema');
        addCase('negative', name, 'Alphabets', 'Enter "abc"', 'Validation error: Must be a valid number');
        addCase('negative', name, 'Scientific notation', 'Enter "1e10"', 'Validation error if not supported');
        addCase('negative', name, 'Symbol characters', 'Enter "$50"', 'Validation error: Remove symbols');
        addCase('edge', name, 'Negative bounds', 'Enter -1', 'Correctly restricts or accepts negative bounds');
        addCase('edge', name, 'Max float precision', 'Enter 99.99999999', 'Precision handled or truncated properly');
        addCase('edge', name, 'Integer max limit', 'Enter 2147483647', 'Handled without 32-bit overflow');
        break;

      case 'Boolean':
        addCase('positive', name, 'True / False explicitly', 'Select True or False explicitly', 'Value accepted');
        addCase('positive', name, '1 / 0 conversion', 'Pass 1 or 0', 'Converted to True/False successfully');
        addCase('positive', name, '"yes" / "no" conversion', 'Pass "yes" or "no"', 'Handled if boolean parser supports it');
        addCase('positive', name, 'Uppercase strings', 'Pass "TRUE"', 'Parsed correctly');
        addCase('negative', name, 'Null value', 'Pass null', 'Validation error or default applied');
        addCase('negative', name, 'Undefined value', 'Omit field from payload', 'Defaulted to false or validation error');
        addCase('negative', name, 'Random string', 'Pass "random_text"', 'Validation error');
        addCase('edge', name, 'Rapid toggle state', 'Toggle boolean rapidly multiple times', 'Final state is saved accurately without race condition');
        addCase('edge', name, 'Concurrent toggles', 'Send true and false simultaneously', 'Latest request wins cleanly');
        addCase('edge', name, 'Massive payload', 'Pass a 1MB string to a boolean field', 'Rejected cleanly before parsing');
        break;

      case 'Password':
        addCase('positive', name, 'Valid strong password', 'Enter 8+ chars, mixed case, numbers, symbols', 'Password accepted securely');
        addCase('positive', name, 'Maximum special chars', 'Enter password with all allowed symbols', 'Password accepted securely');
        addCase('positive', name, 'Spaces included', 'Enter "My Pass word 123!"', 'Accepted and spaces preserved');
        addCase('positive', name, 'Very long string', 'Enter 64 character password', 'Accepted securely');
        addCase('negative', name, 'Weak password', 'Enter "12345" or "password"', 'Validation error: Password does not meet strength criteria');
        addCase('negative', name, 'Missing numbers', 'Enter "StrongPassword!"', 'Validation error: Missing numbers');
        addCase('negative', name, 'Missing symbols', 'Enter "StrongPassword123"', 'Validation error: Missing symbols');
        addCase('edge', name, 'Extremely long password', 'Enter 500+ character password', 'Value hashed securely without DoS vulnerability');
        addCase('edge', name, 'Unicode chars', 'Enter "P@sswörd🔑"', 'Hashed properly with proper encoding');
        addCase('edge', name, 'SQL Injection in password', 'Enter "\' OR 1=1 --"', 'Hashed and stored safely, no injection possible');
        break;

      default:
        // String, Address, City, Country, Zip Code, Company, Job Title, Product Name, Product Category
        addCase('positive', name, 'Standard text input', 'Enter standard alphanumeric string', 'Value accepted');
        addCase('positive', name, 'Multi-line text', 'Enter string with \\n characters', 'Value accepted');
        addCase('positive', name, 'Numbers as strings', 'Enter "12345"', 'Value accepted as string type');
        addCase('positive', name, 'Foreign languages', 'Enter "こんにちは"', 'Unicode characters stored perfectly');
        addCase('negative', name, 'SQL Injection attempts', 'Enter "DROP TABLE users;"', 'Input sanitized or parameterized safely');
        addCase('negative', name, 'XSS attempts', 'Enter "<script>alert(1)</script>"', 'Input sanitized or rejected securely');
        addCase('negative', name, 'Non-printable chars', 'Enter null bytes or control chars', 'Sanitized or rejected');
        addCase('edge', name, 'Empty string', 'Leave empty', 'Handled gracefully, or rejected if required field');
        addCase('edge', name, 'Massive string', 'Paste 10,000 characters', 'Handled gracefully, truncated or blocked');
        addCase('edge', name, 'Exact max length', 'Enter string exactly matching DB varchar limit', 'Accepted without truncation');
        break;
    }
  });

  return result;
};
