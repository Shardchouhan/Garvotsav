/**
 * Garvotsav Tuition Classes - Authentication form validation
 */

document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('[data-auth-form]');

    const validators = {
        fullName: (value) => value.trim().length >= 2 ? '' : 'Full name is required.',
        email: (value) => {
            if (!value.trim()) return 'Email is required.';
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Please enter a valid email address.';
        },
        phone: (value) => {
            if (!value.trim()) return 'Phone number is required.';
            return /^[6-9]\d{9}$/.test(value.trim()) ? '' : 'Please enter a valid 10 digit phone number.';
        },
        applyingClass: (value) => value ? '' : 'Please select the class you are applying for.',
        subject: (_value, form) => form.querySelectorAll('[name="subject"]:checked').length ? '' : 'Please select at least one subject.',
        password: (value) => {
            if (!value) return 'Password is required.';
            return value.length >= 6 ? '' : 'Password must be at least 6 characters.';
        },
        confirmPassword: (value, form) => {
            if (!value) return 'Confirm password is required.';
            const password = form.querySelector('[name="password"]')?.value || '';
            return value === password ? '' : 'Confirm password must match password.';
        }
    };

    const setError = (input, message) => {
        const field = input.closest('.auth-field');
        const error = field?.querySelector('.auth-error');
        const subjectGroup = input.name === 'subject' ? field?.querySelector('[data-subject-group]') : null;
        const errorTarget = subjectGroup || input;
        errorTarget.classList.toggle('is-invalid', Boolean(message));
        errorTarget.setAttribute('aria-invalid', Boolean(message).toString());
        if (error) {
            error.textContent = message;
        }
    };

    const validateInput = (input, form) => {
        const validator = validators[input.name];
        if (!validator) return true;
        const message = validator(input.value, form);
        setError(input, message);
        return !message;
    };

    document.querySelectorAll('[data-toggle-password]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.togglePassword);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            button.innerHTML = `<i class="fa-solid ${isPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
        });
    });

    forms.forEach((form) => {
        const inputs = form.querySelectorAll('input, select');
        const alertBox = form.querySelector('[data-auth-alert]');

        inputs.forEach((input) => {
            input.addEventListener('blur', () => validateInput(input, form));
            input.addEventListener('input', () => {
                const field = input.closest('.auth-field');
                const subjectGroup = input.name === 'subject' ? field?.querySelector('[data-subject-group]') : null;
                if (input.classList.contains('is-invalid') || subjectGroup?.classList.contains('is-invalid')) {
                    validateInput(input, form);
                }
                if (input.name === 'subject') {
                    validateInput(input, form);
                }

                if (input.name === 'password') {
                    const confirmInput = form.querySelector('[name="confirmPassword"]');
                    if (confirmInput?.value) {
                        validateInput(confirmInput, form);
                    }
                }
            });
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const validatedNames = new Set();
            const isValid = Array.from(inputs).every((input) => {
                if (input.name === 'subject') {
                    if (validatedNames.has(input.name)) return true;
                    validatedNames.add(input.name);
                }
                return validateInput(input, form);
            });
            if (!isValid) {
                const firstInvalid = form.querySelector('.is-invalid input, .is-invalid');
                firstInvalid?.focus();
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton?.innerHTML;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';
            }

            if (form.dataset.submitAction && typeof GarvotsavAPI !== 'undefined') {
                const formData = new FormData();
                formData.append('studentName', form.querySelector('[name="fullName"]')?.value.trim() || '');
                formData.append('email', form.querySelector('[name="email"]')?.value.trim() || '');
                formData.append('phone', form.querySelector('[name="phone"]')?.value.trim() || '');
                formData.append('class', form.querySelector('[name="applyingClass"]')?.value || '');
                const selectedSubjects = Array.from(form.querySelectorAll('[name="subject"]:checked')).map(input => input.value);
                formData.append('subject', selectedSubjects.join(', '));

                try {
                    const response = await GarvotsavAPI.submitForm(form.dataset.submitAction, formData);
                    if (!response.success) {
                        throw new Error(response.message || 'Submission failed. Please try again.');
                    }
                } catch (error) {
                    if (alertBox) {
                        alertBox.classList.remove('d-none', 'alert-success');
                        alertBox.classList.add('alert-danger');
                        alertBox.textContent = error.message || 'Submission failed. Please try again.';
                    }
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText;
                    }
                    return;
                }
            }

            if (alertBox) {
                alertBox.classList.remove('d-none', 'alert-danger');
                alertBox.classList.add('alert-success');
                alertBox.textContent = form.dataset.successMessage || 'Success! Redirecting to home page...';
            }

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1200);
        });
    });
});
