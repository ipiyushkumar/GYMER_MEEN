function previewImage(inputId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(`${inputId}Preview`);

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            preview.src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function previewImages(inputId) {
    const input = document.getElementById(inputId);
    const previewContainer = document.getElementById(`${inputId}Preview`);
    previewContainer.innerHTML = '';

    if (input.files && input.files.length > 0 && input.files.length <= 4) {
        Array.from(input.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = index === 0 ? 'image-preview' : 'image-preview-small';
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    } else {
        alert("Please upload between 1 and 4 additional images.");
        input.value = ''; // Clear the input field
    }
}

function addProduct() {
    // Implement the logic to add the product to the inventory
    // You can use the values from the form to create a new product object
    // For now, let's log the values
    console.log("Product added!");
}