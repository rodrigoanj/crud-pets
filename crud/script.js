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

// ==========================
// ELEMENTOS HTML
// ==========================

const form = document.querySelector('form');

const tbody =
document.getElementById('tabela-pets');

const feedback =
document.getElementById('feedback');

const submitButton =
form.querySelector('input[type="submit"]');

// ==========================
// FUNÇÃO DE MENSAGEM
// ==========================

function mostrarMensagem(
    texto,
    tipo = 'success'
) {

    feedback.textContent = texto;

    feedback.style.padding = '10px';

    feedback.style.marginBottom = '10px';

    feedback.style.borderRadius = '8px';

    feedback.style.textAlign = 'center';

    if (tipo === 'success') {

        feedback.style.background =
        '#16a34a';

        feedback.style.color = 'white';
    }

    if (tipo === 'error') {

        feedback.style.background =
        '#dc2626';

        feedback.style.color = 'white';
    }

    setTimeout(() => {

        feedback.textContent = '';

        feedback.style.background =
        'transparent';

    }, 3000);
}

// ==========================
// BOTÃO LOADING
// ==========================

function setLoading(status) {

    submitButton.disabled = status;

    submitButton.value = status
        ? 'Carregando...'
        : 'Cadastrar';
}

// ==========================
// LISTAR PETS
// ==========================

async function carregarPets() {

    try {

        const { data, error } =
        await supabaseClient
            .from('pets')
            .select('*')
            .order('id', {
                ascending: false
            });

        if (error) {

            console.error(error);

            mostrarMensagem(
                error.message,
                'error'
            );

            return;
        }

        tbody.innerHTML = '';

        data.forEach((pet) => {

            const tr =
            document.createElement('tr');

            tr.innerHTML = `

                <td>${pet.nome}</td>

                <td>${pet.raca}</td>

                <td>${pet.idade}</td>

                <td>${pet.especie}</td>

                <td>

                    <button
                        class="btn-editar"
                        onclick="editarPet(${pet.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirPet(${pet.id})"
                    >
                        Excluir
                    </button>

                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (err) {

        console.error(err);

        mostrarMensagem(
            'Erro ao carregar pets',
            'error'
        );
    }
}

// ==========================
// CADASTRAR PET
// ==========================

form.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();

        setLoading(true);

        try {

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

            const { error } =
            await supabaseClient
                .from('pets')
                .insert([
                    {
                        nome,
                        raca,
                        idade,
                        especie
                    }
                ]);

            if (error) {

                console.error(error);

                mostrarMensagem(
                    error.message,
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

    const { error } =
    await supabaseClient
        .from('pets')
        .delete()
        .eq('id', id);

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

    const { data: pet } =
    await supabaseClient
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();

    const { value: formValues } =
    await Swal.fire({

        title: 'Editar Pet',

        html: `

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
                .value
            };
        }
    });

    if (!formValues) return;

    const { error } =
    await supabaseClient
        .from('pets')
        .update(formValues)
        .eq('id', id);

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
// INICIA O SISTEMA
// ==========================

carregarPets();