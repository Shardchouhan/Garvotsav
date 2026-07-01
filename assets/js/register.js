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
        board: 'Board',
        fatherName: "Father's Name",
        motherName: "Mother's Name",
        parentOccupation: "Parent's Occupation",
        annualFamilyIncome: 'Annual Family Income',
        permanentAddress: 'Permanent Address',
        mobileNumber: 'Mobile Number',
        mountAbuResident: 'Residence Information',
        declarationAccepted: 'Declaration',
        registrationFeeTransactionId: 'Registration Fee Transaction ID',
        monthlyFeeTransactionId: 'Monthly Fee Transaction ID'
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
        } else if (input.name === 'mobileNumber' && !/^[6-9]\d{9}$/.test(value)) {
            message = 'Please enter a valid 10 digit mobile number.';
        } else if (input.name === 'annualFamilyIncome' && Number(value) < 0) {
            message = 'Annual Family Income cannot be negative.';
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
        } else if (name === 'declarationAccepted' && checked.value !== 'Yes') {
            message = 'Please select Yes to submit the registration form.';
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
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) validateInput(input);
        });
    });

    ['gender', 'mountAbuResident', 'declarationAccepted'].forEach((name) => {
        getRadioGroup(name).forEach((radio) => {
            radio.addEventListener('change', () => validateRadioGroup(name));
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        alertBox.classList.add('d-none');

        const regularInputs = Array.from(form.querySelectorAll('input:not([type="radio"]), select, textarea'));
        const isRegularValid = regularInputs.every(validateInput);
        const isRadioValid = ['gender', 'mountAbuResident', 'declarationAccepted'].every(validateRadioGroup);

        if (!isRegularValid || !isRadioValid) {
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

            showAlert('success', '<i class="fa-solid fa-circle-check me-2"></i> Registration submitted successfully!');
            form.reset();
        } catch (error) {
            showAlert('danger', `<i class="fa-solid fa-triangle-exclamation me-2"></i> ${error.message || 'Registration failed. Please try again.'}`);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});
