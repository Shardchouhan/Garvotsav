document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    const alertBox = document.getElementById('registrationAlert');
    const submitButton = document.getElementById('registrationSubmitBtn');
    const originalButtonText = submitButton.innerHTML;

    const fieldLabels = {
        studentFirstName: 'Student First Name',
        studentLastName: 'Student Last Name',
        birthDate: 'Birth Date',
        gender: 'Gender',
        schoolName: 'School Name',
        classGrade: 'Class',
        board: 'Board',
        fatherName: "Father's Name",
        motherName: "Mother's Name",
        parentOccupation: "Parent's Occupation",
        permanentAddress: 'Permanent Address',
        mobileNumber: 'Mobile Number',
        mountAbuResident: 'Residence Information',
        declarationInfoTrue: 'Information Declaration',
        declarationFeeAdvance: 'Fee Advance Declaration',
        paymentMode: 'Payment Mode'
    };

    const getFieldWrap = (input) => input.closest('.auth-field');
    const getErrorBox = (input) => getFieldWrap(input)?.querySelector('.auth-error');
    const getRadioGroup = (name) => form.querySelectorAll(`[name="${name}"]`);

    const setError = (input, message) => {
        const wrap = getFieldWrap(input);
        const errorBox = getErrorBox(input);
        wrap?.classList.toggle('has-error', Boolean(message));
        input.classList.toggle('is-invalid', Boolean(message));
        input.setAttribute('aria-invalid', Boolean(message).toString());
        if (errorBox) errorBox.textContent = message;
    };

    const validateInput = (input) => {
        if (!input.name || input.type === 'radio') return true;
        let message = '';

        const value = input.value.trim();
        if (input.required && !value) {
            message = `${fieldLabels[input.name] || 'This field'} is required.`;
        } else if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            message = 'Please enter a valid email address.';
        } else if (input.name === 'mobileNumber' && value && !/^[6-9]\d{9}$/.test(value)) {
            message = 'Please enter a valid 10 digit mobile number.';
        }

        setError(input, message);
        return !message;
    };

    const validateRadioGroup = (name) => {
        const radios = Array.from(getRadioGroup(name));
        if (!radios.length) return true;
        const checked = radios.find((radio) => radio.checked);
        let message = '';

        if (!checked) {
            message = `${fieldLabels[name] || 'This option'} is required.`;
        } else if ((name === 'declarationInfoTrue' || name === 'declarationFeeAdvance') && checked.value !== 'Yes') {
            message = 'You must select Yes to proceed.';
        }

        radios.forEach((radio) => {
            radio.classList.toggle('is-invalid', Boolean(message));
            radio.setAttribute('aria-invalid', Boolean(message).toString());
        });

        const firstRadio = radios[0];
        const wrap = getFieldWrap(firstRadio);
        const errorBox = getErrorBox(firstRadio);
        wrap?.classList.toggle('has-error', Boolean(message));
        if (errorBox) errorBox.textContent = message;

        return !message;
    };

    const showAlert = (type, message) => {
        alertBox.classList.remove('d-none', 'alert-success', 'alert-danger');
        alertBox.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
        alertBox.innerHTML = message;
    };

    form.querySelectorAll('input:not([type="radio"]), select, textarea').forEach((input) => {
        const events = ['blur', 'input'];
        events.forEach(eventType => {
            input.addEventListener(eventType, () => {
                if (eventType === 'input' && !input.classList.contains('is-invalid')) return;
                validateInput(input);
            });
        });
    });

    ['gender', 'mountAbuResident', 'declarationInfoTrue', 'declarationFeeAdvance', 'paymentMode'].forEach((name) => {
        getRadioGroup(name).forEach((radio) => {
            radio.addEventListener('change', () => {
                validateRadioGroup(name);

                // Payment mode toggle
                if (name === 'paymentMode') {
                    const onlinePaymentDetails = document.getElementById('onlinePaymentDetails');
                    const cashPaymentDetails = document.getElementById('cashPaymentDetails');

                    if (radio.value === 'Online') {
                        onlinePaymentDetails.style.display = 'block';
                        cashPaymentDetails.style.display = 'none';
                        // Clear screenshot error when switching back
                        const screenshotDropzone = document.getElementById('screenshotDropzone');
                        if (screenshotDropzone) {
                            screenshotDropzone.style.borderColor = '';
                            screenshotDropzone.style.background = '';
                        }
                        const screenshotField = screenshotDropzone?.closest('.auth-field');
                        const errBox = screenshotField?.querySelector('.auth-error');
                        if (errBox) errBox.textContent = '';
                    } else if (radio.value === 'Cash') {
                        onlinePaymentDetails.style.display = 'none';
                        cashPaymentDetails.style.display = 'block';
                    }
                }
            });
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        alertBox.classList.add('d-none');

        const regularInputs = Array.from(form.querySelectorAll('input:not([type="radio"]), select, textarea')).filter(input => {
            if (!input.required && !input.value) return false;
            const wrap = input.closest('.payment-details-block');
            if (wrap && wrap.style.display === 'none') return false;
            return true;
        });

        const isRegularValid = regularInputs.map(validateInput).every(v => v);
        const isRadioValid = ['gender', 'mountAbuResident', 'declarationInfoTrue', 'declarationFeeAdvance', 'paymentMode'].map(validateRadioGroup).every(v => v);

        // Screenshot required for Online payment
        const paymentModeSelected = form.querySelector('[name="paymentMode"]:checked');
        const screenshotInput = document.getElementById('paymentScreenshot');
        const screenshotDropzone = document.getElementById('screenshotDropzone');
        const screenshotField = screenshotDropzone?.closest('.auth-field');
        const screenshotErrorBox = screenshotField?.querySelector('.auth-error');
        let isScreenshotValid = true;

        if (paymentModeSelected && paymentModeSelected.value === 'Online') {
            if (!screenshotInput || !screenshotInput.files || screenshotInput.files.length === 0) {
                isScreenshotValid = false;
                if (screenshotDropzone) {
                    screenshotDropzone.style.borderColor = '#ff6b6b';
                    screenshotDropzone.style.background = 'rgba(255,107,107,0.06)';
                }
                if (screenshotErrorBox) screenshotErrorBox.textContent = 'Payment screenshot is required for Online Payment.';
                screenshotDropzone?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        if (!isRegularValid || !isRadioValid || !isScreenshotValid) {
            if (isRegularValid && isRadioValid && !isScreenshotValid) return;
            const firstInvalid = form.querySelector('.is-invalid');
            firstInvalid?.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';

        try {
            const response = await GarvotsavAPI.submitForm(form.dataset.submitAction, new FormData(form));
            if (!response.success) {
                throw new Error(response.message || 'Registration failed. Please try again.');
            }

            form.reset();
            // Reset dropzone UI
            const dropzoneInner = document.getElementById('screenshotDropzoneInner');
            const screenshotPreview = document.getElementById('screenshotPreview');
            if (dropzoneInner) dropzoneInner.style.display = 'flex';
            if (screenshotPreview) screenshotPreview.style.display = 'none';

            const popup = document.getElementById('successPopupReg');
            if (popup) popup.classList.add('active');
        } catch (error) {
            showAlert('danger', `<i class="fa-solid fa-triangle-exclamation me-2"></i> ${error.message || 'Registration failed. Please try again.'}`);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});
