document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const confirmSubmitButton = document.getElementById('final_submit');

    // Set up the form submission handler
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way
        confirmModal.show(); // Show the confirmation modal
    });

    // Set up the confirmation button handler
    confirmSubmitButton.addEventListener('click', function () {
        const formData = {
            'ProjectTitle': document.getElementById("projectTitle").value,
            'Seeking': document.getElementById("lookingFor").value,
            'Deliverables': document.getElementById("deliverables").value,
            'Deadline': document.getElementById("deadline").value,
            'Compensation': document.getElementById("compensation").value,
            'Contact': document.getElementById("contact").value,
            'ProjectDescription': document.getElementById("description").value
        };
        
        const jsonFormData = JSON.stringify(formData);
        fetch('../submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonFormData
        })
        .then(response => response.json())
        .then(data => {
            confirmModal.hide(); // Hide the confirmation modal
            if (data.success) {
                // Show the Bootstrap modal
                const successModal = new bootstrap.Modal(document.getElementById('successfulModal'));
                successModal.show();

                // Add listener to redirect when the modal is closed
                document.getElementById('successfulModal').addEventListener('hidden.bs.modal', () => {
                    window.location.href = 'index.html';
                });
            } else {
                // Handle failure
                console.error('Form submission failed:', data.message);
            }
        })
        .catch(error => {
            confirmModal.hide(); // Hide the confirmation modal on error
            console.error('Error submitting form:', error);
        });
    });
});
