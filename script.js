// ==========================
// CONFIGURAÇÃO DO SUPABASE
// ==========================

const SUPABASE_URL =
'https://likpgqykiiodtdxwptyq.supabase.co';

const SUPABASE_KEY =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpa3BncXlraWlvZHRkeHdwdHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDkwMTUsImV4cCI6MjA5NTU4NTAxNX0.CLc0otzOIeF8zoOJDFvacYoKmC4quD04EJGl7V7PHYM';

// CRIA A CONEXÃO COM O SUPABASE
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const STORAGE_BUCKET = 'pet-photos';

// ==========================
// ELEMENTOS HTML
// ==========================

const form = document.querySelector('form');
const tbody = document.getElementById('tabela-pets');
const petsContainer = document.getElementById('pets-container');
const feedback = document.getElementById('feedback');
const submitButton = form?.querySelector('input[type="submit"]');

// ==========================
// FUNÇÃO DE MENSAGEM
// ==========================

function mostrarMensagem(
    texto,
    tipo = 'success'
) {

    if (!feedback) return;

    feedback.textContent = texto;
    feedback.style.padding = '10px';
    feedback.style.marginBottom = '10px';
    feedback.style.borderRadius = '8px';
    feedback.style.textAlign = 'center';

    if (tipo === 'success') {
        feedback.style.background = '#16a34a';
        feedback.style.color = 'white';
    }

    if (tipo === 'error') {
        feedback.style.background = '#dc2626';
        feedback.style.color = 'white';
    }

    setTimeout(() => {
        feedback.textContent = '';
        feedback.style.background = 'transparent';
    }, 3000);
}

// ==========================
// BOTÃO LOADING
// ==========================

function setLoading(status) {
    if (!submitButton) return;

    submitButton.disabled = status;
    submitButton.value = status
        ? 'Carregando...'
        : 'Cadastrar';
}

// ==========================
// UPLOAD DE FOTO
// ==========================

async function uploadPetPhoto(file) {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = fileName;

    const { data, error: uploadError } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        throw uploadError;
    }

    const { data: publicData, error: urlError } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    if (urlError) {
        throw urlError;
    }

    return publicData.publicUrl;
}

// ==========================
// LISTAR PETS
// ==========================

async function carregarPets() {
    try {
        let query = supabaseClient
            .from('pets')
            .select('*')
            .order('id', {
                ascending: false
            });

        let data, error;

        try {
            // timeout de 5 segundos para carregar pets
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('carregarPets timeout')), 5000)
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
                error.message || 'Erro ao carregar pets',
                'error'
            );
            return;
        }

        // Renderiza cards em meus-pets.html, tabela em index.html
        const currentPage = document.body.getAttribute('data-page');
        if (currentPage === 'meus-pets') {
            renderPetCards(data);
        } else {
            renderPetTable(data);
        }
    } catch (err) {
        console.error(err);
        mostrarMensagem(
            'Erro ao carregar pets',
            'error'
        );
    }
}

function renderPetTable(data) {
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Nenhum pet registrado</td></tr>';
        return;
    }

    data.forEach((pet) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pet.nome_dono || '—'}</td>
            <td>${pet.nome}</td>
            <td>${pet.raca}</td>
            <td>${pet.idade}</td>
            <td>${pet.especie}</td>
            <td>${pet.peso || '—'}</td>
            <td>${pet.observacoes || '—'}</td>
            <td>
                <button class="btn-editar" onclick="editarPet(${pet.id})">Editar</button>
                <button class="btn-excluir" onclick="excluirPet(${pet.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function formatDate(value) {
    if (!value) return 'Não disponível';
    return new Date(value).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ==========================
// IMAGEM PADRÃO
// ==========================

const DEFAULT_PET_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%230f172a" width="200" height="200"/%3E%3Ccircle cx="100" cy="70" r="30" fill="%233b82f6"/%3E%3Cellipse cx="80" cy="50" rx="8" ry="12" fill="%231e293b"/%3E%3Cellipse cx="120" cy="50" rx="8" ry="12" fill="%231e293b"/%3E%3Ccircle cx="90" cy="75" r="4" fill="%231e293b"/%3E%3Ccircle cx="110" cy="75" r="4" fill="%231e293b"/%3E%3Cpath d="M 95 85 Q 100 90 105 85" stroke="%231e293b" stroke-width="2" fill="none"/%3E%3Crect x="75" y="105" width="15" height="40" fill="%233b82f6"/%3E%3Crect x="110" y="105" width="15" height="40" fill="%233b82f6"/%3E%3Crect x="80" y="150" width="12" height="35" fill="%236b7280"/%3E%3Crect x="108" y="150" width="12" height="35" fill="%236b7280"/%3E%3Ctext x="100" y="200" text-anchor="middle" font-size="12" fill="%238b5cf6"%3EPet%3C/text%3E%3C/svg%3E';

// ==========================
// RENDERIZAR CARDS
// ==========================

function renderPetCards(data) {
    if (!petsContainer) return;
    petsContainer.innerHTML = '';

    if (!data || data.length === 0) {
        petsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #cbd5e1;">Nenhum pet registrado</div>';
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
                <button class="delete" onclick="excluirPet(${pet.id})">Excluir</button>
            </div>
        `;
        petsContainer.appendChild(card);
    });
}

// ==========================
// CADASTRAR PET
// ==========================

if (form) {
    form.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault();

            setLoading(true);

            try {

                const nomeDono =
                document
                .getElementById('NomeDono')
                .value;

                const nome =
                document
                .getElementById('NomePet')
                .value;

                const raca =
                document
                .getElementById('RacaPet')
                .value;

                const idade =
                document
                .getElementById('IdadePet')
                .value;

                const especie =
                document
                .getElementById('EspeciePet')
                .value;

                const peso =
                document
                .getElementById('PesoPet')
                .value;

                const observacoes =
                document
                .getElementById('ObservacoesPet')
                .value;

                const fotoArquivo =
                document
                .getElementById('FotoPet')
                .files[0];

                let photoUrl = null;
                if (fotoArquivo) {
                    photoUrl = await uploadPetPhoto(fotoArquivo);
                }

                let error, insertData;

                try {
                    // timeout de 5 segundos para insert
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('insert timeout')), 5000)
                    );

                    const insertPromise = supabaseClient
                        .from('pets')
                        .insert([
                            {
                                nome,
                                nome_dono: nomeDono,
                                raca,
                                idade,
                                especie,
                                peso,
                                observacoes,
                                photo_url: photoUrl
                            }
                        ]);

                    insertData = await Promise.race([insertPromise, timeoutPromise]);
                    error = insertData.error;
                } catch (err) {
                    error = err;
                }

                if (error) {

                    console.error(error);

                    mostrarMensagem(
                        error.message || 'Erro ao cadastrar pet',
                        'error'
                    );

                    setLoading(false);

                    return;
                }

                Swal.fire({

                    title: 'Sucesso!',

                    text:
                    'Pet cadastrado com sucesso.',

                    icon: 'success',

                    background: '#1e293b',

                    color: '#fff',

                    confirmButtonColor: '#3b82f6'
                });

                form.reset();
                document.getElementById('FotoPet').value = '';
                document.getElementById('ObservacoesPet').value = '';

                carregarPets();

            } catch (err) {

                console.error(err);

                mostrarMensagem(
                    'Erro inesperado',
                    'error'
                );
            }

            setLoading(false);
        }
    );
}

// ==========================
// EXCLUIR PET
// ==========================

async function excluirPet(id) {

    const resultado = await Swal.fire({

        title: 'Excluir Pet?',

        text:
        'Essa ação não poderá ser desfeita.',

        icon: 'warning',

        showCancelButton: true,

        confirmButtonText: 'Sim, excluir',

        cancelButtonText: 'Cancelar',

        confirmButtonColor: '#ef4444',

        cancelButtonColor: '#64748b',

        background: '#1e293b',

        color: '#fff'
    });

    if (!resultado.isConfirmed) return;

    let error;

    try {
        // timeout de 5 segundos para delete
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
        );

        const deletePromise = supabaseClient
            .from('pets')
            .delete()
            .eq('id', id);

        const result = await Promise.race([deletePromise, timeoutPromise]);
        error = result.error;
    } catch (err) {
        error = err;
    }

    if (error) {

        console.error(error);

        Swal.fire({

            title: 'Erro',

            text: error.message,

            icon: 'error',

            background: '#1e293b',

            color: '#fff'
        });

        return;
    }

    Swal.fire({

        title: 'Excluído!',

        text: 'Pet removido com sucesso.',

        icon: 'success',

        timer: 1800,

        showConfirmButton: false,

        background: '#1e293b',

        color: '#fff'
    });

    carregarPets();
}

// ==========================
// EDITAR PET
// ==========================

async function editarPet(id) {

    let petData;

    try {
        // timeout de 5 segundos para carregar pet
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
        );

        const selectPromise = supabaseClient
            .from('pets')
            .select('*')
            .eq('id', id)
            .single();

        const result = await Promise.race([selectPromise, timeoutPromise]);
        petData = result.data;

        if (result.error) {
            throw result.error;
        }
    } catch (err) {
        Swal.fire({
            title: 'Erro',
            text: 'Não foi possível carregar o pet',
            icon: 'error',
            background: '#1e293b',
            color: '#fff'
        });
        return;
    }

    const pet = petData;

    const { value: formValues } =
    await Swal.fire({

        title: 'Editar Pet',

        html: `

            <input
                id="swal-nome-dono"
                class="swal2-input"
                placeholder="Nome do Dono"
                value="${pet.nome_dono || ''}"
            >

            <input
                id="swal-nome"
                class="swal2-input"
                placeholder="Nome"
                value="${pet.nome}"
            >

            <input
                id="swal-raca"
                class="swal2-input"
                placeholder="Raça"
                value="${pet.raca}"
            >

            <input
                id="swal-idade"
                class="swal2-input"
                placeholder="Idade"
                value="${pet.idade}"
            >

            <input
                id="swal-especie"
                class="swal2-input"
                placeholder="Espécie"
                value="${pet.especie}"
            >

            <input
                id="swal-peso"
                class="swal2-input"
                placeholder="Peso"
                value="${pet.peso || ''}"
            >

            <textarea
                id="swal-observacoes"
                class="swal2-textarea"
                placeholder="Observações"
            >${pet.observacoes || ''}</textarea>
        `,

        focusConfirm: false,

        showCancelButton: true,

        confirmButtonText: 'Salvar',

        cancelButtonText: 'Cancelar',

        confirmButtonColor: '#3b82f6',

        cancelButtonColor: '#64748b',

        background: '#1e293b',

        color: '#fff',

        preConfirm: () => {

            return {

                nome_dono:
                document
                .getElementById('swal-nome-dono')
                .value,

                nome:
                document
                .getElementById('swal-nome')
                .value,

                raca:
                document
                .getElementById('swal-raca')
                .value,

                idade:
                document
                .getElementById('swal-idade')
                .value,

                especie:
                document
                .getElementById('swal-especie')
                .value,

                peso:
                document
                .getElementById('swal-peso')
                .value,

                observacoes:
                document
                .getElementById('swal-observacoes')
                .value
            };
        }
    });

    if (!formValues) return;

    let error;

    try {
        // timeout de 5 segundos para update
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
        );

        const updatePromise = supabaseClient
            .from('pets')
            .update(formValues)
            .eq('id', id);

        const result = await Promise.race([updatePromise, timeoutPromise]);
        error = result.error;
    } catch (err) {
        error = err;
    }

    if (error) {

        console.error(error);

        Swal.fire({

            title: 'Erro',

            text: error.message || 'Erro ao atualizar',

            icon: 'error',

            background: '#1e293b',

            color: '#fff'
        });

        return;
    }

    Swal.fire({

        title: 'Atualizado!',

        text: 'Pet atualizado com sucesso.',

        icon: 'success',

        timer: 1800,

        showConfirmButton: false,

        background: '#1e293b',

        color: '#fff'
    });

    carregarPets();
}

// ==========================
// VER CARTEIRINHA DO PET
// ==========================

async function verCarteirinha(id) {
    try {
        let petData;

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 5000)
            );

            const selectPromise = supabaseClient
                .from('pets')
                .select('*')
                .eq('id', id)
                .single();

            const result = await Promise.race([selectPromise, timeoutPromise]);
            petData = result.data;

            if (result.error) {
                throw result.error;
            }
        } catch (err) {
            Swal.fire({
                title: 'Erro',
                text: 'Não foi possível carregar a carteirinha',
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
            return;
        }

        const pet = petData;
        const petImage = (pet.photo_url && pet.photo_url.trim()) ? pet.photo_url : DEFAULT_PET_IMAGE;
        const dataCadastro = formatDate(pet.created_at);

        await Swal.fire({
            title: 'Carteirinha do Pet',
            html: `
                <div style="text-align: left; background: rgba(255,255,255,0.05); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                    <img src="${petImage}" alt="${pet.nome}" onerror="this.src='${DEFAULT_PET_IMAGE}'" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; display: block; background: #0f172a;">
                    
                    <div style="display: grid; gap: 12px;">
                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                            <strong style="color: #06b6d4;">Nome do Pet:</strong>
                            <p style="margin: 4px 0 0 0; color: #e2e8f0;">${pet.nome}</p>
                        </div>

                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                            <strong style="color: #06b6d4;">Nome do Dono:</strong>
                            <p style="margin: 4px 0 0 0; color: #e2e8f0;">${pet.nome_dono || '—'}</p>
                        </div>

                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                            <strong style="color: #06b6d4;">Espécie:</strong>
                            <p style="margin: 4px 0 0 0; color: #e2e8f0;">${pet.especie || '—'}</p>
                        </div>

                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                            <strong style="color: #06b6d4;">Raça:</strong>
                            <p style="margin: 4px 0 0 0; color: #e2e8f0;">${pet.raca || '—'}</p>
                        </div>

                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                            <strong style="color: #06b6d4;">Idade:</strong>
                            <p style="margin: 4px 0 0 0; color: #e2e8f0;">${pet.idade || '—'} anos</p>
                        </div>

                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                            <strong style="color: #06b6d4;">Peso:</strong>
                            <p style="margin: 4px 0 0 0; color: #e2e8f0;">${pet.peso || '—'} kg</p>
                        </div>

                        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                            <strong style="color: #06b6d4;">Observações:</strong>
                            <p style="margin: 4px 0 0 0; color: #e2e8f0;">${pet.observacoes || '—'}</p>
                        </div>

                        <div>
                            <strong style="color: #06b6d4;">Data de Cadastro:</strong>
                            <p style="margin: 4px 0 0 0; color: #e2e8f0;">${dataCadastro}</p>
                        </div>
                    </div>
                </div>
            `,
            confirmButtonText: 'Fechar',
            confirmButtonColor: '#3b82f6',
            background: '#1e293b',
            color: '#fff',
            width: '500px'
        });
    } catch (err) {
        console.error(err);
        Swal.fire({
            title: 'Erro',
            text: 'Erro ao carregar carteirinha',
            icon: 'error',
            background: '#1e293b',
            color: '#fff'
        });
    }
}

// ==========================
// INICIA O SISTEMA
// ==========================

carregarPets();
