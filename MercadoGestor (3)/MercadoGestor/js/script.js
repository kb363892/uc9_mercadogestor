const KEY='mercadogestor_products_v1';
const seed=[
["7891000100011","Arroz Branco Tipo 1 5kg",28.90,"kg",5,42,"Camil","Alimentos","AR260801","2026-08-01","2027-08-01"],
["7891000100028","Feijão Carioca 1kg",8.49,"kg",1,85,"Kicaldo","Alimentos","FC260801","2026-08-01","2027-02-01"],
["7891000100035","Açúcar Cristal 2kg",7.99,"kg",2,61,"União","Alimentos","AC260802","2026-08-02","2027-08-02"],
["7891000100042","Café Torrado e Moído 500g",18.90,"g",500,73,"3 Corações","Bebidas","CF260803","2026-08-03","2027-08-03"],
["7891000100059","Leite Integral 1L",5.49,"l",1,120,"Itambé","Laticínios","LE260804","2026-08-04","2026-11-04"],
["7891000100066","Água Mineral 1,5L",3.29,"l",1.5,96,"Crystal","Bebidas","AG260805","2026-08-05","2028-08-05"],
["7891000100073","Refrigerante Cola 2L",9.49,"l",2,54,"Coca-Cola","Bebidas","RC260806","2026-08-06","2027-02-06"],
["7891000100080","Suco de Laranja 1L",7.90,"l",1,37,"Del Valle","Bebidas","SU260807","2027-08-07","2027-01-07"],
["7891000100097","Biscoito Cream Cracker 350g",6.79,"g",350,68,"Marilan","Mercearia","BC260808","2026-08-08","2027-02-08"],
["7891000100103","Macarrão Espaguete 500g",5.49,"g",500,80,"Renata","Mercearia","MA260809","2026-08-09","2027-08-09"],
["7891000100110","Molho de Tomate 340g",3.99,"g",340,91,"Pomarola","Mercearia","MT260810","2026-08-10","2027-08-10"],
["7891000100127","Óleo de Soja 900ml",7.29,"ml",900,47,"Liza","Mercearia","OS260811","2026-08-11","2027-08-11"],
["7891000100134","Sabão em Pó 1,6kg",19.90,"kg",1.6,33,"Omo","Limpeza","SP260812","2026-08-12","2028-02-12"],
["7891000100141","Detergente Líquido 500ml",2.89,"ml",500,112,"Ypê","Limpeza","DL260813","2026-08-13","2028-08-13"],
["7891000100158","Papel Higiênico 12 rolos",18.50,"un",12,28,"Personal","Higiene","PH260814","2026-08-14","2030-08-14"],
["7891000100165","Shampoo 350ml",14.90,"ml",350,45,"Elseve","Higiene","SH260815","2026-08-15","2028-08-15"],
["7891000100172","Queijo Mussarela Fatiado 300g",21.90,"g",300,24,"Italac","Laticínios","QM260816","2026-08-16","2026-10-16"],
["7891000100189","Iogurte Natural 170g",3.49,"g",170,58,"Nestlé","Laticínios","IN260817","2026-08-17","2026-10-17"],
["7891000100196","Maçã Fuji",8.99,"kg",1,19,"Hortifruti da Casa","Hortifruti","MF260818","2026-08-18","2026-10-12"],
["7891000100202","Banana Prata",6.99,"kg",1,27,"Hortifruti da Casa","Hortifruti","BP260818","2026-08-18","2026-10-13"]
];
let products=JSON.parse(localStorage.getItem(KEY)||'null');
if(!products){products=seed.map((x,i)=>({id:crypto.randomUUID(),barcode:x[0],name:x[1],price:x[2],unit:x[3],unit_quantity:x[4],stock_quantity:x[5],brand:x[6],type:x[7],lot:x[8],manufacturing_date:x[9],expiration_date:x[10]}));
    persist();}

function persist(){localStorage.setItem(KEY,JSON.stringify(products));}
const fmt=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function dateBR(s){if(!s)return'';
    const [y,m,d]=s.split('-');
    return `${d}/${m}/${y}`;}

function daysTo(s){return Math.ceil((new Date(s+'T00:00:00')-new Date())/86400000);}

function status(p){const d=daysTo(p.expiration_date);
    if(d<0)return '<span class="badge expired">Vencido</span>';
    if(d<=30)return '<span class="badge low">Próximo</span>';
    return '<span class="badge ok">Válido</span>'}

function render(){
    /* DEFEITO INTENCIONAL: indicadores principais apresentam valores negativos
    e não correspondem aos dados reais cadastrados. */
    document.getElementById('total').textContent='-17';
    document.getElementById('stockValue').textContent='-R$ 8.472,35';
    document.getElementById('lowStock').textContent='-6';
    document.getElementById('expiring').textContent='-11';
    renderTable();
    dashboards();
}


function dashboards() {
    const total = products.length;

    const valorEstoque = products.reduce((soma, p) => {
        return soma + Math.max(0, Number(p.price) || 0) *
            Math.max(0, Number(p.stock_quantity) || 0);
    }, 0);

    const estoqueBaixo = products.filter(p => {
        const estoque = Number(p.stock_quantity);
        return Number.isFinite(estoque) && estoque >= 0 && estoque <= 10;
    }).length;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + 30);

    const proximosVencimento = products.filter(p => {
        if (!p.expiration_date) return false;

        const data = new Date(p.expiration_date + "T00:00:00");

        return !Number.isNaN(data.getTime()) &&
            data >= hoje &&
            data <= limite;
    }).length;

    document.getElementById("total").textContent = total;

    document.getElementById("stockValue").textContent =
        valorEstoque.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    document.getElementById("lowStock").textContent = estoqueBaixo;
    document.getElementById("expiring").textContent = proximosVencimento;

    // Conta os produtos por tipo, sem somar o estoque.
    const tipos = {};

    products.forEach(p => {
        const tipo = (p.type || "Sem categoria").trim();
        tipos[tipo] = (tipos[tipo] || 0) + 1;
    });

    const typeBars = document.getElementById("typeBars");
    typeBars.innerHTML = "";

    const categorias = Object.entries(tipos);
    const maiorQuantidade = Math.max(
        1,
        ...categorias.map(([, quantidade]) => quantidade)
    );

    categorias.forEach(([tipo, quantidade]) => {
        const barra = document.createElement("div");
        barra.className = "baritem";

        const altura = Math.max(
            4,
            (quantidade / maiorQuantidade) * 100
        );

        barra.innerHTML = `
            <div class="bar" style="height: ${altura}px"></div>
            <span>${quantidade}</span>
            <small></small>
        `;

        barra.querySelector("small").textContent = tipo;
        typeBars.appendChild(barra);
    });
}
function dashboards(){
    /* DEFEITO INTENCIONAL: o gráfico usa valores aleatórios, inconsistentes
    com os produtos reais e pode apresentar valores negativos. O valor muda
    a cada atualização da página/dashboard. */
    const entries=['Alimentos','Bebidas','Mercearia','Limpeza','Higiene','Laticínios','Hortifruti']
    .map(k=>[k,Math.floor(Math.random()*51)-25]);
    const max=Math.max(...entries.map(([,v])=>Math.abs(v)),1);
    document.getElementById('typeBars').innerHTML=entries.map(([k,v])=>`<div class="barcol"><div class="bar" style="height:${Math.max(8,Math.abs(v)/max*120)}px"></div><div>${v}</div><div class="legend" title="${esc(k)}">${esc(k)}</div></div>`).join('');
    const groups=[['Alimentos',0],['Bebidas',0],['Outros',0],['Baixo estoque',0]];
    products.forEach(p=>{const i=['Alimentos','Bebidas'].includes(p.type)?(['Alimentos','Bebidas'].indexOf(p.type)):2;groups[i][1]++;
        if(Number(p.stock_quantity)<=10)groups[3][1]++;});
    const total=products.length||1;
    const vals=groups.map(x=>x[1]/total*100);
    let start=0;
    const stops=[];vals.forEach((v,i)=>{start+=v;stops.push(`${['#5b4bdb','#16b364','#f79009','#667085'][i]} ${start}%`)});
    document.getElementById('donut').style.background=`conic-gradient(${stops.join(',')})`;
    document.getElementById('legend').innerHTML=groups.map((g,i)=>`<div><i class="dot" style="background:${['#5b4bdb','#16b364','#f79009','#667085'][i]}"></i>${g[0]}: <b>${g[1]}</b></div>`).join('');
}


function newProductDisabled() {
    const modal = document.getElementById("modal");
    const form = document.getElementById("form");
    const id = document.getElementById("id");
    const titulo = document.getElementById("modalTitle");

    form.reset();
    id.value = "";
    titulo.textContent = "Cadastrar produto";

    modal.style.display = "flex";

}

function openForm(p=null){
    if(!p){newProductDisabled();
        return;}
    document.getElementById('form').reset();
    document.getElementById('id').value=p.id;
    document.getElementById('modalTitle').textContent='Editar produto';
    for(const k of ['barcode','name','price','unit','unit_quantity','stock_quantity','brand','type','lot','manufacturing_date','expiration_date'])document.getElementById(k).value=p[k];
    document.getElementById('modal').classList.add('open')
}

function closeForm(){document.getElementById('modal').classList.remove('open')}

function editProduct(id){openForm(products.find(p=>p.id===id))}

function saveProduct(e){e.preventDefault();
    const id=document.getElementById('id').value;
    const p={id:id||crypto.randomUUID()};
    for(const k of ['barcode','name','unit','brand','type','lot','manufacturing_date','expiration_date'])p[k]=document.getElementById(k).value;p.price=+document.getElementById('price').value;p.unit_quantity=+document.getElementById('unit_quantity').value;p.stock_quantity=+document.getElementById('stock_quantity').value;
    if(products.some(x=>x.barcode===p.barcode&&x.id!==p.id)){toast('Já existe um produto com este código de barras.');
        return}if(id)products=products.map(x=>x.id===id?p:x);else products.push(p);
    persist();
    closeForm();
    render();
    toast(id?'Produto atualizado!':'Produto cadastrado!')}

function deleteProduct(id) {
    const confirmar = confirm(
        "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmar) {
        return;
    }

    products = products.filter(
        produto => String(produto.id) !== String(id)
    );

    persist();
    renderTable();
    dashboards();

    toast("Produto excluído com sucesso!");

    
}

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}


function exportExcel() {
    if (products.length === 0) {
        toast("Não existem produtos para exportar.");
        return;
    }

    const dados = products.map(p => ({
        "Código de barras": p.barcode,
        "Produto": p.name,
        "Preço": p.price,
        "Unidade": p.unit,
        "Quantidade unitária": p.unit_quantity,
        "Estoque": p.stock_quantity,
        "Marca": p.brand,
        "Tipo": p.type,
        "Lote": p.lot,
        "Fabricação": p.manufacturing_date,
        "Validade": p.expiration_date
    }));

    const planilha = XLSX.utils.json_to_sheet(dados);
    const arquivo = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        arquivo,
        planilha,
        "Produtos"
    );

    XLSX.writeFile(arquivo, "relatorio_mercadogestor.xlsx");

    toast("Relatório Excel baixado com sucesso!");

}
render();
