/**
 * AC Framework Landing Page - Copy to Clipboard
 */

(function() {
  'use strict';
  
  const copyBtn = document.getElementById('copy-btn');
  const installCommand = document.getElementById('install-command');
  
  if (!copyBtn || !installCommand) return;
  
  const originalText = copyBtn.querySelector('.terminal__copy-text')?.textContent || 'Copy';
  
  copyBtn.addEventListener('click', async function() {
    const command = installCommand.textContent;
    
    try {
      await navigator.clipboard.writeText(command);
      
      // Visual feedback
      copyBtn.classList.add('is-copied');
      const textSpan = copyBtn.querySelector('.terminal__copy-text');
      if (textSpan) {
        textSpan.textContent = 'Copied!';
      }
      
      // Reset after 2 seconds
      setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        if (textSpan) {
          textSpan.textContent = originalText;
        }
      }, 2000);
      
    } catch (err) {
      console.error('Failed to copy:', err);
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = command;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        copyBtn.classList.add('is-copied');
        const textSpan = copyBtn.querySelector('.terminal__copy-text');
        if (textSpan) {
          textSpan.textContent = 'Copied!';
        }
        
        setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          if (textSpan) {
            textSpan.textContent = originalText;
          }
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      
      document.body.removeChild(textArea);
    }
  });
})();
