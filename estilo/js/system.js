document.addEventListener('DOMContentLoaded', function() {
    // Guias de recursos
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe ativa de todos os botões e painéis
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Adicionar classe ativa ao botão clicado e ao painel correspondente
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const pane = document.getElementById(tabId);
            pane.classList.add('active');
            pane.querySelectorAll('.animate-fade-in, .animate-slide-in').forEach(el => el.classList.add('is-visible'));
        });
    });
    
    
    // Acordeão de perguntas frequentes
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                const item = this.closest('.accordion-item');
                if (item) {
                    item.classList.add('is-visible');
                }
            }
        });
    });
    
    // Abrir primeiro tab por padrão
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
});
