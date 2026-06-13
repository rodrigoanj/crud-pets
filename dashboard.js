// ==========================
// DASHBOARD - CARREGAMENTO
// ==========================

const recentPetsContainer = document.getElementById('recent-pets-container');

async function carregarEstatisticas() {
    try {
        // Carrega todos os pets
        let query = supabaseClient
            .from('pets')
            .select('*')
            .order('created_at', {
                ascending: false
            });

        let data, error;

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 5000)
            );

            const result = await Promise.race([query, timeoutPromise]);
            data = result.data;
            error = result.error;
        } catch (err) {
            error = err;
            data = null;
        }

        if (error) {
            console.error(error);
            mostrarMensagem(
                error.message || 'Erro ao carregar estatísticas',
                'error'
            );
            return;
        }

        // Calcula estatísticas
        const totalPets = data.length;
        const totalCaes = data.filter(p => p.tipo_animal && p.tipo_animal.toLowerCase() === 'cão').length;
        const totalGatos = data.filter(p => p.tipo_animal && p.tipo_animal.toLowerCase() === 'gato').length;
        const totalOutros = totalPets - totalCaes - totalGatos;

        // Atualiza elementos
        document.getElementById('total-pets').textContent = totalPets;
        document.getElementById('total-dogs').textContent = totalCaes;
        document.getElementById('total-cats').textContent = totalGatos;
        document.getElementById('total-others').textContent = totalOutros;

        // Renderiza últimos 6 pets
        const ultimosPets = data.slice(0, 6);
        renderRecentPets(ultimosPets);

    } catch (err) {
        console.error(err);
        mostrarMensagem(
            'Erro ao carregar estatísticas',
            'error'
        );
    }
}

function renderRecentPets(data) {
    if (!recentPetsContainer) return;
    recentPetsContainer.innerHTML = '';

    if (!data || data.length === 0) {
        recentPetsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #cbd5e1;">Nenhum pet registrado</div>';
        return;
    }

    data.forEach((pet) => {
        const petImage = (pet.photo_url && pet.photo_url.trim()) ? pet.photo_url : DEFAULT_PET_IMAGE;
        
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.innerHTML = `
            <img src="${petImage}" alt="${pet.nome}" onerror="this.src='${DEFAULT_PET_IMAGE}'">
            <div class="pet-card-content">
                <h2>${pet.nome}</h2>
                <p><strong>Dono:</strong> ${pet.nome_dono || '—'}</p>
                <p><strong>Raça:</strong> ${pet.raca || '—'}</p>
                <p><strong>Espécie:</strong> ${pet.especie || '—'}</p>
                <span class="badge">${pet.especie || 'Pet'}</span>
            </div>
            <div class="pet-card-actions">
                <button class="view" onclick="verCarteirinha(${pet.id})">Ver Carteirinha</button>
            </div>
        `;
        recentPetsContainer.appendChild(card);
    });
}

// Carrega estatísticas ao iniciar
carregarEstatisticas();
