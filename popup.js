// Assuming the checkbox ids are named appropriately in popup.html
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const button = document.getElementById('toggleCustomization');
    const statusText = document.getElementById('statusText');

    function saveSettings() {
        let settings = {};
        checkboxes.forEach(checkbox => {
            settings[checkbox.id] = checkbox.checked;
        });
        chrome.storage.local.set({ settings: settings });
    }

    chrome.storage.local.get(['settings'], function(result) {
        if (result.settings) {
            checkboxes.forEach(checkbox => {
                checkbox.checked = result.settings[checkbox.id] || false;
            });
        }
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveSettings);
    });

    button.addEventListener('click', function() {
        triggerContentScript();
        statusText.textContent = '保存成功';
    });

    function triggerContentScript() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'activate',
                settings: Array.from(checkboxes).reduce((acc, checkbox) => {
                    acc[checkbox.id] = checkbox.checked;
                    return acc;
                }, {})
            });
        });
    }
});
