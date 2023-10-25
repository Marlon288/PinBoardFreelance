        
document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevents the default form submission action
    console.log("Test")
    // 1. Capture the form data
    const formData = {
        'Project Title': document.getElementById("projectTitle").value,
        'Seeking': document.getElementById("lookingFor").value,
        'Deliverables': document.getElementById("deliverables").value,
        'Deadline': document.getElementById("deadline").value,
        'Compensation': document.getElementById("compensation").value,
        'Project Description': document.getElementById("description").value
    };

    // 2. Use jsPDF to create a PDF
    
    const doc = jsPDF('portrait', 'mm', 'a5');

    doc.setFontSize(18);  // Reduced size for A5
    doc.setFont('helvetica', 'bold');
    doc.text('Looking for Help', 49, 20, { align: 'center' });  // Adjusted for A5

    // Horizontal line after the title
    doc.setDrawColor(0);
    doc.line(10, 25, 148 - 10, 25);  // Adjusted for A5

    // Section for project details
    doc.setFontSize(14);  // Reduced size for A5
    doc.setFont('helvetica', 'bold');
    doc.text('Details', 20, 35);  // Adjusted for A5

    doc.setFontSize(10);  // Reduced size for A5
    doc.setFont('helvetica', 'normal');

    let maxWidth = 90;  // Define the maximum width you want for the text
    let description = formData['Project Description'];
    // Assuming you've already captured the form data into `formData`
    let yOffset = 45;  // Adjusted for A5
    for (let label in formData) {
        const value = formData[label];
        if (value) {
            if(value == description){
                doc.setFont('helvetica', 'bold');
                doc.text(`${label} :`, 10, yOffset);  // Adjusted for A5

                let lines = doc.splitTextToSize(description, maxWidth);
                doc.setFont('helvetica', 'normal');
                for (let i = 0; i < lines.length; i++) {
                    doc.text(50, yOffset, lines[i], { align: 'justify' });  // X position remains constant, Y changes with each line
                    yOffset += 5;
                }
            }else{
                doc.setFont('helvetica', 'bold');
                doc.text(`${label} :`, 10, yOffset);  // Adjusted for A5
            
                doc.setFont('helvetica', 'normal');
                doc.text(value, 50, yOffset);  // Adjusted for A5 and the longest label
            
            yOffset += 8;  // Adjusted for A5
            }

        }
    }

    // Footer - Contact Information
    doc.setFontSize(12);  // Reduced size for A5
    doc.setFont('helvetica', 'bold');
    doc.text('Contact', 10, 195, { align: 'left' });  // Near the bottom of the A5 page and adjusted for A5

    doc.setFontSize(10);  // Reduced size for A5
    doc.setFont('helvetica', 'normal');



    // Print the text at the bottom right of the A5 page
    // '210' is the height of an A5 page in portrait mode.
    doc.text(document.getElementById("contact").value, 10, 200);  // subtracting 10 for a margin from the bottom
    // Save the PDF
    //doc.save("project_info.pdf");

    // Convert the PDF to a Blob
    let blobPDF = doc.output('blob');

    // Send the Blob to the server using Fetch API
    let formDataPDF = new FormData();
    formDataPDF.append('pdf', blobPDF);

    fetch('../upload', {
        method: 'POST',
        body: formDataPDF
    })
    .then(response => response.json())
    .then(data => {
        // Here you can handle the server response (like showing a link to the uploaded PDF or displaying the generated QR code)
        console.log(data);
    })
    .catch(error => {
        console.error('Error uploading the PDF:', error);
    });

});