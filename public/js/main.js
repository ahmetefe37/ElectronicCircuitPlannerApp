document.addEventListener('DOMContentLoaded', () => {
  const circuitForm = document.getElementById('circuitForm');
  const loadingAlert = document.getElementById('loadingAlert');
  const resultsCard = document.getElementById('resultsCard');
  const resultContent = document.getElementById('resultContent');
  
  if (circuitForm) {
    circuitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const circuitSpec = document.getElementById('circuitSpec').value;
      
      if (!circuitSpec.trim()) {
        alert('Please enter circuit specifications!');
        return;
      }
      
      try {
        // Show loading state
        loadingAlert.classList.remove('d-none');
        resultsCard.classList.add('d-none');
        
        // Send data to the server
        const response = await fetch('/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ circuitSpec }),
        });
        
        const data = await response.json();
        
        // Hide loading alert
        loadingAlert.classList.add('d-none');
        
        if (data.success) {
          // Show quick preview of results
          const previewContent = createPreviewContent(data.message);
          resultContent.innerHTML = `
            <div class="ai-response">
              ${previewContent}
              <div class="mt-4 text-center">
                <a href="/output" class="btn btn-primary">View Detailed Results</a>
              </div>
            </div>
          `;
          resultsCard.classList.remove('d-none');
          
          // Scroll to results
          resultsCard.scrollIntoView({ behavior: 'smooth' });
        } else {
          showError(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        loadingAlert.classList.add('d-none');
        showError('An error occurred while generating the circuit plan. Please try again later.');
      }
    });
  }
  
  // Function to create a brief preview of the AI response
  function createPreviewContent(text) {
    if (!text) return '';
    
    // Get first 300 characters as preview
    const preview = text.slice(0, 300).trim();
    return `
      <h5>Analysis Preview:</h5>
      <p>${preview}...</p>
      <p class="text-muted">See detailed results with the button below.</p>
    `;
  }
  
  // Function to show error message
  function showError(message) {
    resultContent.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <h5>Error</h5>
        <p>${message}</p>
      </div>
    `;
    resultsCard.classList.remove('d-none');
  }
}); 