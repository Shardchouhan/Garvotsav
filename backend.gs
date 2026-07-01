/**
 * GARVOTSAV TUITION CLASSES - GOOGLE APPS SCRIPT BACKEND
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Go to Google Drive -> New -> Google Sheets (Name it "Garvotsav_DB")
 * 2. Create the following Sheets (Tabs) exactly named:
 *    - Courses
 *    - Testimonials
 *    - Teachers
 *    - FAQs
 *    - Contact
 *    - Admission
 * 3. In the Spreadsheet menu, go to Extensions -> Apps Script
 * 4. Paste this entire code into `Code.gs` (replace existing code)
 * 5. Add your Google Sheet ID to the SHEET_ID variable below.
 *    (The ID is the long string in the sheet's URL between /d/ and /edit)
 * 6. Click Deploy -> New Deployment
 *    - Select type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the Web App URL and paste it into `assets/js/api.js` (APPS_SCRIPT_URL)
 */

const SHEET_ID = '1IlEAW7A92IEJATOtsrvOEnnxolUuUUiZKP8JNiKUbRs'; 

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getData') {
    const sheetName = e.parameter.sheet;
    return ContentService.createTextOutput(JSON.stringify(getSheetData(sheetName)))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: "Invalid Action"}))
      .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  
  if (action === 'submitContact' || action === 'submitAdmission') {
    return handleFormSubmission(e, action === 'submitContact' ? 'Contact' : 'Admission');
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, message: "Invalid Action"}))
      .setMimeType(ContentService.MimeType.JSON);
}

const ADMISSION_HEADERS = [
  'Timestamp',
  'Student First Name',
  'Student Last Name',
  'Birth Date',
  'Gender',
  'School Name',
  'Board',
  "Father's Name",
  "Mother's Name",
  "Parent's Occupation",
  'Annual Family Income',
  'Permanent Address',
  'Email Address',
  'Mobile Number',
  'Mount Abu Resident',
  'Declaration Accepted',
  'Registration Fee Transaction ID',
  'Monthly Fee Transaction ID'
];

const ADMISSION_REQUIRED_FIELDS = [
  ['studentFirstName', 'Student First Name'],
  ['studentLastName', 'Student Last Name'],
  ['birthDate', 'Birth Date'],
  ['gender', 'Gender'],
  ['schoolName', 'School Name'],
  ['board', 'Board'],
  ['fatherName', "Father's Name"],
  ['motherName', "Mother's Name"],
  ['parentOccupation', "Parent's Occupation"],
  ['annualFamilyIncome', 'Annual Family Income'],
  ['permanentAddress', 'Permanent Address'],
  ['mobileNumber', 'Mobile Number'],
  ['mountAbuResident', 'Mount Abu Resident'],
  ['declarationAccepted', 'Declaration Accepted'],
  ['registrationFeeTransactionId', 'Registration Fee Transaction ID'],
  ['monthlyFeeTransactionId', 'Monthly Fee Transaction ID']
];

// Helper: Get data from a specific sheet as an array of objects
function getSheetData(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // No data or just headers
    
    const headers = data[0].map(h => h.toString().toLowerCase());
    const results = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      results.push(obj);
    }
    
    return results;
  } catch (error) {
    return { error: error.toString() };
  }
}

// Helper: Handle form submissions
function handleFormSubmission(e, sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (sheetName === 'Contact') {
        sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Subject', 'Message']);
      } else {
        sheet.appendRow(ADMISSION_HEADERS);
      }
    } else if (sheetName === 'Admission') {
      const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), ADMISSION_HEADERS.length)).getValues()[0];
      const headersNeedUpdate = ADMISSION_HEADERS.some((header, index) => existingHeaders[index] !== header);
      if (headersNeedUpdate) {
        sheet.getRange(1, 1, 1, ADMISSION_HEADERS.length).setValues([ADMISSION_HEADERS]);
      }
    }
    
    // Build row data based on form type
    const timestamp = new Date();
    let rowData = [];
    
    if (sheetName === 'Contact') {
      rowData = [
        timestamp,
        e.parameter.name || '',
        e.parameter.email || '',
        e.parameter.phone || '',
        e.parameter.subject || '',
        e.parameter.message || ''
      ];
    } else if (sheetName === 'Admission') {
      const missingFields = ADMISSION_REQUIRED_FIELDS
        .filter(([field]) => !String(e.parameter[field] || '').trim())
        .map(([, label]) => label);

      if (missingFields.length) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Missing required fields: ' + missingFields.join(', ')
        })).setMimeType(ContentService.MimeType.JSON);
      }

      if (e.parameter.declarationAccepted !== 'Yes') {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Declaration must be accepted before submission.'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      rowData = [
        timestamp,
        e.parameter.studentFirstName || '',
        e.parameter.studentLastName || '',
        e.parameter.birthDate || '',
        e.parameter.gender || '',
        e.parameter.schoolName || '',
        e.parameter.board || '',
        e.parameter.fatherName || '',
        e.parameter.motherName || '',
        e.parameter.parentOccupation || '',
        e.parameter.annualFamilyIncome || '',
        e.parameter.permanentAddress || '',
        e.parameter.emailAddress || '',
        e.parameter.mobileNumber || '',
        e.parameter.mountAbuResident || '',
        e.parameter.declarationAccepted || '',
        e.parameter.registrationFeeTransactionId || '',
        e.parameter.monthlyFeeTransactionId || ''
      ];
    }
    
    sheet.appendRow(rowData);
    
    // Optional: Send email notification to admin
    // MailApp.sendEmail("admin@example.com", "New " + sheetName + " Submission", "A new form was submitted.");
    
    return ContentService.createTextOutput(JSON.stringify({success: true, message: "Data submitted successfully"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
