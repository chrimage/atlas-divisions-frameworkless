// Handle auto-submit for status changes
document.addEventListener('DOMContentLoaded', function() {
    const selects = document.querySelectorAll('[data-auto-submit="true"]');
    selects.forEach(function(select) {
        select.addEventListener('change', function() {
            // Ensure the form is correctly referenced and submitted
            if (this.form) {
                this.form.submit();
            } else {
                // Fallback for older browsers or unexpected structures:
                // Find the closest form ancestor and submit it.
                let parent = this.parentNode;
                while (parent && parent.tagName !== 'FORM') {
                    parent = parent.parentNode;
                }
                if (parent) {
                    parent.submit();
                } else {
                    console.error('Could not find form to submit for auto-submit select.');
                }
            }
        });
    });
});
