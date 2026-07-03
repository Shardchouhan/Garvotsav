/**
 * GARVOTSAV TUITION CLASSES - GOOGLE APPS SCRIPT BACKEND
 *
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Open your Google Sheet -> Extensions -> Apps Script
 * 2. Paste this entire code into Code.gs (replace all existing code)
 * 3. Click Deploy -> New Deployment
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Click "Authorize access" and grant all permissions
 * 5. Copy the Web App URL and paste it into assets/js/api.js (APPS_SCRIPT_URL)
 */

const SHEET_ID    = '1IlEAW7A92IEJATOtsrvOEnnxolUuUUiZKP8JNiKUbRs';
const ADMIN_EMAIL = 'divkumar61@gmail.com';

// ─── Sheet Column Headers ─────────────────────────────────────────────────────

const REGISTRATION_HEADERS = [
  'Timestamp',
  'Registration ID',
  'Student First Name',
  'Student Last Name',
  'Birth Date',
  'Gender',
  'School Name',
  'Class',
  'Board',
  "Father's Name",
  "Mother's Name",
  "Parent's Occupation",
  'Permanent Address',
  'Email Address',
  'Mobile Number',
  'Mount Abu Resident',
  'Declaration – Info True',
  'Declaration – Fee Advance',
  'Payment Mode',
  'Payment Screenshot URL',
  'Payment Verification Status'
];

const CONTACT_HEADERS = [
  'Timestamp', 'Name', 'Email', 'Phone', 'Subject', 'Message'
];

// ─── Entry Points ─────────────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getData') {
    return json(getSheetData(e.parameter.sheet));
  }
  return json({ error: 'Invalid Action' });
}

function doPost(e) {
  try {
    const action = e.parameter.action;
    if (action === 'submitAdmission') return handleRegistration(e);
    if (action === 'submitContact')   return handleContact(e);
    return json({ success: false, message: 'Invalid Action' });
  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return json({ success: false, message: 'Server error: ' + err.toString() });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    Logger.log('Created new sheet: ' + name);
  } else {
    // Auto-fix headers if they changed
    const lastCol = Math.max(sheet.getLastColumn(), headers.length);
    const existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    if (headers.some((h, i) => existing[i] !== h)) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log('Updated headers for sheet: ' + name);
    }
  }
  return sheet;
}

function getSheetData(sheetName) {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    const headers = data[0].map(h => h.toString().toLowerCase());
    return data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
  } catch (err) {
    Logger.log('getSheetData error: ' + err);
    return { error: err.toString() };
  }
}

function generateRegistrationId(timestamp) {
  const dateStr   = Utilities.formatDate(timestamp, 'Asia/Kolkata', 'yyyyMMdd');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return 'GTC-' + dateStr + '-' + randomNum;
}

// ─── Registration Handler ─────────────────────────────────────────────────────

function handleRegistration(e) {
  Logger.log('handleRegistration called');
  Logger.log('Parameters: ' + JSON.stringify(e.parameter).substring(0, 500));

  const ss        = SpreadsheetApp.openById(SHEET_ID);
  const sheet     = getOrCreateSheet(ss, 'Registrations', REGISTRATION_HEADERS);
  const timestamp = new Date();

  // Validate basic required fields (only truly essential ones)
  const name = (e.parameter.studentFirstName || '').trim();
  const mobile = (e.parameter.mobileNumber || '').trim();
  if (!name || !mobile) {
    Logger.log('Validation failed: missing name or mobile');
    return json({ success: false, message: 'Student name and mobile number are required.' });
  }

  // Generate Registration ID
  const registrationId = generateRegistrationId(timestamp);
  Logger.log('Generated Registration ID: ' + registrationId);

  // ── STEP 1: Save data to sheet immediately ──
  const studentFullName = (e.parameter.studentFirstName || '') + ' ' + (e.parameter.studentLastName || '');
  const rowData = [
    timestamp,
    registrationId,
    e.parameter.studentFirstName    || '',
    e.parameter.studentLastName     || '',
    e.parameter.birthDate           || '',
    e.parameter.gender              || '',
    e.parameter.schoolName          || '',
    e.parameter.classGrade          || '',
    e.parameter.board               || '',
    e.parameter.fatherName          || '',
    e.parameter.motherName          || '',
    e.parameter.parentOccupation    || '',
    e.parameter.permanentAddress    || '',
    e.parameter.emailAddress        || '',
    e.parameter.mobileNumber        || '',
    e.parameter.mountAbuResident    || '',
    e.parameter.declarationInfoTrue || '',
    e.parameter.declarationFeeAdvance || '',
    e.parameter.paymentMode         || '',
    'Processing...',   // screenshot URL placeholder
    'Pending Verification'
  ];

  sheet.appendRow(rowData);
  Logger.log('Row appended to Registrations sheet');

  // Find the row we just inserted to update screenshot URL later
  const lastRow = sheet.getLastRow();

  // ── STEP 2: Upload screenshot to Drive ──
  let screenshotUrl = '';
  if (e.parameter.paymentScreenshotBase64) {
    try {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(e.parameter.paymentScreenshotBase64),
        e.parameter.paymentScreenshotMimeType || 'image/png',
        e.parameter.paymentScreenshotName    || 'Payment_Screenshot'
      );
      const file = DriveApp.getRootFolder().createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      screenshotUrl = file.getUrl();
      Logger.log('Screenshot saved to Drive: ' + screenshotUrl);

      // Update the screenshot URL column (column 20 = index 19)
      const screenshotCol = REGISTRATION_HEADERS.indexOf('Payment Screenshot URL') + 1;
      sheet.getRange(lastRow, screenshotCol).setValue(screenshotUrl);
    } catch (imgErr) {
      Logger.log('Screenshot upload error: ' + imgErr.toString());
      screenshotUrl = 'Upload failed: ' + imgErr.toString();
      const screenshotCol = REGISTRATION_HEADERS.indexOf('Payment Screenshot URL') + 1;
      sheet.getRange(lastRow, screenshotCol).setValue(screenshotUrl);
    }
  } else {
    // No screenshot provided (e.g. cash payment)
    const screenshotCol = REGISTRATION_HEADERS.indexOf('Payment Screenshot URL') + 1;
    sheet.getRange(lastRow, screenshotCol).setValue('N/A');
  }

  // ── STEP 3: Send Admin Email ──
  try {
    const paymentSection = e.parameter.paymentMode === 'Cash'
      ? '<p><strong>Payment Mode:</strong> Cash</p><p><strong>Status:</strong> Monthly Fee Cash – Pending Verification</p>'
      : '<p><strong>Payment Mode:</strong> Online (UPI)</p>' +
        '<p><strong>Payment Screenshot:</strong> ' +
        (screenshotUrl ? '<a href="' + screenshotUrl + '">View Screenshot</a>' : 'Not uploaded') +
        '</p><p><strong>Status:</strong> Pending Verification</p>';

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: 'New Registration – ' + registrationId,
      htmlBody:
        '<h2 style="color:#5a3e8e;">New Student Registration</h2>' +
        '<p><strong>Registration ID:</strong> ' + registrationId + '</p>' +
        '<p><strong>Date &amp; Time:</strong> ' + timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + '</p>' +
        '<hr>' +
        '<h3>Student Details</h3>' +
        '<p><strong>Name:</strong> ' + studentFullName.trim() + '</p>' +
        '<p><strong>Father\'s Name:</strong> ' + (e.parameter.fatherName || '') + '</p>' +
        '<p><strong>Mother\'s Name:</strong> ' + (e.parameter.motherName || '') + '</p>' +
        '<p><strong>Mobile:</strong> ' + (e.parameter.mobileNumber || '') + '</p>' +
        '<p><strong>Email:</strong> ' + (e.parameter.emailAddress || 'N/A') + '</p>' +
        '<p><strong>School:</strong> ' + (e.parameter.schoolName || '') + '</p>' +
        '<p><strong>Class:</strong> ' + (e.parameter.classGrade || '') + '</p>' +
        '<p><strong>Board:</strong> ' + (e.parameter.board || '') + '</p>' +
        '<p><strong>Gender:</strong> ' + (e.parameter.gender || '') + '</p>' +
        '<p><strong>Address:</strong> ' + (e.parameter.permanentAddress || '') + '</p>' +
        '<p><strong>Parent Occupation:</strong> ' + (e.parameter.parentOccupation || '') + '</p>' +
        '<p><strong>Mount Abu Resident:</strong> ' + (e.parameter.mountAbuResident || '') + '</p>' +
        '<hr>' +
        '<h3>Payment Details</h3>' + paymentSection
    });
    Logger.log('Admin email sent to: ' + ADMIN_EMAIL);
  } catch (mailErr) {
    Logger.log('Admin email error: ' + mailErr.toString());
  }

  // ── STEP 4: Send Student Confirmation Email ──
  if (e.parameter.emailAddress) {
    try {
      const paymentNote = e.parameter.paymentMode === 'Cash'
        ? '<p>Your registration will be confirmed after your monthly fee is received and verified at our center.</p>'
        : '<p>Your payment screenshot has been received and is being verified. We will update you once confirmed.</p>';

      MailApp.sendEmail({
        to: e.parameter.emailAddress,
        subject: 'Registration Received – ' + registrationId + ' | Garvotsav Tuition Classes',
        htmlBody:
          '<h2 style="color:#5a3e8e;">Registration Received!</h2>' +
          '<p>Dear ' + studentFullName.trim() + ',</p>' +
          '<p>Thank you for registering with <strong>Garvotsav Tuition Classes</strong>.</p>' +
          '<table style="border-collapse:collapse;width:100%;max-width:500px;">' +
          '<tr><td style="padding:6px 10px;font-weight:bold;">Registration ID</td><td style="padding:6px 10px;">' + registrationId + '</td></tr>' +
          '<tr style="background:#f5f5f5;"><td style="padding:6px 10px;font-weight:bold;">Date</td><td style="padding:6px 10px;">' + timestamp.toDateString() + '</td></tr>' +
          '<tr><td style="padding:6px 10px;font-weight:bold;">Payment Mode</td><td style="padding:6px 10px;">' + (e.parameter.paymentMode || '') + '</td></tr>' +
          '<tr style="background:#f5f5f5;"><td style="padding:6px 10px;font-weight:bold;">Status</td><td style="padding:6px 10px;">Pending Verification</td></tr>' +
          '</table><br>' + paymentNote +
          '<br><p>Best regards,<br><strong>Garvotsav Tuition Classes</strong></p>'
      });
      Logger.log('Student email sent to: ' + e.parameter.emailAddress);
    } catch (mailErr) {
      Logger.log('Student email error: ' + mailErr.toString());
    }
  }

  return json({ success: true, message: 'Registration submitted successfully. ID: ' + registrationId });
}

// ─── Contact Handler ──────────────────────────────────────────────────────────

function handleContact(e) {
  Logger.log('handleContact called');
  const ss        = SpreadsheetApp.openById(SHEET_ID);
  const sheet     = getOrCreateSheet(ss, 'Contact Messages', CONTACT_HEADERS);
  const timestamp = new Date();

  sheet.appendRow([
    timestamp,
    e.parameter.name    || '',
    e.parameter.email   || '',
    e.parameter.phone   || '',
    e.parameter.subject || '',
    e.parameter.message || ''
  ]);
  Logger.log('Contact row appended');

  try {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: 'New Contact Inquiry from ' + (e.parameter.name || 'Unknown'),
      htmlBody:
        '<h3>New Contact Inquiry</h3>' +
        '<p><strong>Name:</strong> ' + (e.parameter.name || '') + '</p>' +
        '<p><strong>Email:</strong> ' + (e.parameter.email || '') + '</p>' +
        '<p><strong>Phone:</strong> ' + (e.parameter.phone || '') + '</p>' +
        '<p><strong>Subject:</strong> ' + (e.parameter.subject || '') + '</p>' +
        '<p><strong>Message:</strong><br>' + (e.parameter.message || '') + '</p>'
    });
  } catch (mailErr) { Logger.log('Contact admin mail error: ' + mailErr); }

  if (e.parameter.email) {
    try {
      MailApp.sendEmail({
        to: e.parameter.email,
        subject: 'We received your inquiry – Garvotsav Tuition Classes',
        htmlBody:
          '<h3>Thank you for reaching out!</h3>' +
          '<p>Dear ' + (e.parameter.name || '') + ',</p>' +
          '<p>We have received your message. Our team will get back to you shortly.</p>' +
          '<br><p>Best regards,<br><strong>Garvotsav Tuition Classes</strong></p>'
      });
    } catch (mailErr) { Logger.log('Contact ack mail error: ' + mailErr); }
  }

  return json({ success: true, message: 'Message sent successfully.' });
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ── RUN THIS ONCE TO GRANT PERMISSIONS ───────────────────────────────────────
 * 1. Select "testPermissions" from the function dropdown
 * 2. Click ▶ Run → Review Permissions → Allow
 */
function testPermissions() {
  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: 'Garvotsav – Permissions Active ✅',
    htmlBody: '<p>Gmail and Google Drive permissions are active for Garvotsav backend.</p>'
  });
  const f = DriveApp.getRootFolder().createFile('garvotsav_permission_test.txt', 'OK');
  f.setTrashed(true);
  Logger.log('✅ testPermissions passed. Email sent to: ' + ADMIN_EMAIL);
}

/**
 * ── DEBUG: Test registration manually ────────────────────────────────────────
 * Run this in the editor to simulate a registration and check for errors.
 */
function testRegistration() {
  const mockEvent = {
    parameter: {
      action: 'submitAdmission',
      studentFirstName: 'Test',
      studentLastName: 'Student',
      birthDate: '2010-01-01',
      gender: 'Male',
      schoolName: 'Test School',
      classGrade: '9',
      board: 'CBSE',
      fatherName: 'Test Father',
      motherName: 'Test Mother',
      parentOccupation: 'Business',
      permanentAddress: 'Mount Abu, Rajasthan',
      emailAddress: ADMIN_EMAIL,
      mobileNumber: '9876543210',
      mountAbuResident: 'Yes',
      declarationInfoTrue: 'Yes',
      declarationFeeAdvance: 'Yes',
      paymentMode: 'Cash'
    }
  };
  const result = handleRegistration(mockEvent);
  Logger.log('Test result: ' + result.getContent());
}
