

document.addEventListener('DOMContentLoaded', function () {

    const submissionModalElement = document.getElementById('submissionModal');
    submissionModalElement.addEventListener('hidden.bs.modal', function (event) {
        // Use the history API to manipulate the URL without refreshing the page
        const url = new URL(window.location.href);
        url.searchParams.delete('modal'); // Remove the modal query parameter
        window.history.pushState({}, '', url); // Update the URL
    });


    fetch('/submissions')
        .then(response => response.json())
        .then(data => {

        const cardsContainer = document.getElementById('cards-container');
        data.forEach(submission => {
            console.log(submission);
            const cardHtml = `
            <div class="col-sm-3">
                <div class="card mx-2 my-4">
                <div class="card-body">
                    <h5 class="card-title">${submission.ProjectTitle}</h5>
                    <p class="card-text">Seeking: ${submission.Seeking}</p>
                    <p class="card-text">Compensation: ${submission.Compensation}</p>
                    <button type="button" class="btn btn-primary" onclick='showDetails("${submission.id}")'>
                    Find out more
                    </button>
                </div>
                </div>
            </div>
            `;
            cardsContainer.innerHTML += cardHtml;
        });
        });

        const urlParams = new URLSearchParams(window.location.search);
        const submissionId = urlParams.get('modal'); // Assuming 'modal' is your URL parameter
        if (submissionId) {
            // Fetch the specific submission data using the ID from the URL parameter
            showDetails(submissionId)
        }
    });

function showDetails(submissionId) {
    // Here you would fetch your data and then populate the modal.
    fetch(`/submissions/${submissionId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            populateModalContent(data);
            const modal = new bootstrap.Modal(document.getElementById('submissionModal'));
            modal.show();
            
            // Add the modalId as a query parameter to the URL
            const url = new URL(window.location);
            url.searchParams.set('modal', submissionId);
            window.history.pushState({}, '', url);
        })
        .catch(error => {
            console.error('Error fetching submission details:', error);
        });
}

// This function populates the modal with the fetched content
function populateModalContent(data) {
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer'); // Make sure this is correct
    modalBody.innerHTML = '';

    // Add the new content
    for (const [key, value] of Object.entries(data)) {
        if(key == "id") continue;
        const paragraph = document.createElement('p');
        paragraph.innerHTML = `<strong>${key}:</strong> ${value}`;
        modalBody.appendChild(paragraph);
    }

    // Construct the buttons HTML and set it in one go
    window.currentData = data;
    
    const buttonsHtml = `
        <button type="button" id="qrCodeBtn" class="btn btn-info" onclick="downloadQRCode('${data.id}')">QR Code</button>
        <button type="button" id="flyerBtn" class="btn btn-info" onclick="downloadFlyer()">Flyer</button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = buttonsHtml;
}

   
function downloadQRCode(submissionId) {
    // Construct the URL that points to your web application with the modal parameter
    //CHANGE TO ACTUAL URL
    console.log(submissionId)
    const urlToEncode = `http://localhost:3000/?modal=${submissionId}`;
    
    // Generate the QR code using the library
    QRCode.toDataURL(urlToEncode, function (err, url) {
        if (err) {
            console.error('Error generating QR code', err);
            return;
        }

        // Create a link element, set the href to the QR code URL, and trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        // You can set the default name of the downloaded file here
        downloadLink.download = `QRCode-${submissionId}.png`;

        // Append the link to the body, click it, and then remove it
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}
function downloadFlyer() {
    const submission = window.currentData;
    const formData = {
        'Project Title': submission.ProjectTitle || "",
        'Seeking': submission.Seeking || "",
        'Deliverables': submission.Deliverables || "",
        'Deadline': submission.Deadline || "",
        'Compensation': submission.Compensation || "",
        'Project Description': submission.ProjectDescription || ""
    };

    // Initialize jsPDF
    const doc = jsPDF('portrait', 'mm', 'a5');

    //CHANGE URL
    const urlToEncode = `http://localhost:3000/?modal=${submission.id}`;
    QRCode.toDataURL(urlToEncode, { errorCorrectionLevel: 'H' }, function (err, url) {
        if (err) {
            console.error('Error generating QR code', err);
            return;
        }


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
        doc.text(submission.Contact, 10, 200);  // subtracting 10 for a margin from the bottom

        const qrCodeDimensions = 25; // Example size, adjust as needed
        doc.addImage(url, 'PNG', 118, 180, qrCodeDimensions, qrCodeDimensions); // Adjust position (x, y) and size as needed

        // Save the PDF
        //doc.save("project_info.pdf"); 

        // Download the PDF
        const pdfName = formData['Project Title'].replace(/\s+/g, '_') + '.pdf';
        doc.save(pdfName);
    });
}


    