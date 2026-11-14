var KEY = "gastos-casa";
var itens = [];

function carregar() {
  try { itens = JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch (e) { itens = []; }
}
function salvar() {
  try { localStorage.setItem(KEY, JSON.stringify(itens)); } catch (e) {}
}
function brl(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function hoje() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function meses() {
  var s = {};
  s[hoje().slice(0, 7)] = 1;
  itens.forEach(function (i) { s[i.data.slice(0, 7)] = 1; });
  var sel = document.getElementById("mes");
  var atual = sel.value || hoje().slice(0, 7);
  sel.innerHTML = "";
  Object.keys(s).sort().reverse().forEach(function (m) {
    var o = document.createElement("option");
    o.value = m;
    var p = m.split("-");
    o.textContent = new Date(p[0], p[1] - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    sel.appendChild(o);
  });
  sel.value = s[atual] ? atual : hoje().slice(0, 7);
}

function mostrar() {
  var m = document.getElementById("mes").value;
  var fl = itens
    .filter(function (i) { return i.data.slice(0, 7) === m; })
    .sort(function (a, b) { return b.data.localeCompare(a.data); });
  var t = fl.reduce(function (s, i) { return s + i.valor; }, 0);
  document.getElementById("total").textContent = brl(t);

  var L = document.getElementById("lista");
  if (!fl.length) {
    L.innerHTML = '<div class="empty">Nenhum gasto neste mês ainda.</div>';
    return;
  }
  L.innerHTML = "";
  fl.forEach(function (i) {
    var d = document.createElement("div");
    d.className = "item";

    var a = document.createElement("div");
    var b = document.createElement("b");
    b.textContent = i.desc;
    var c = document.createElement("span");
    c.className = "mut";
    c.textContent = i.cat + " · " + i.data.split("-").reverse().join("/");
    a.appendChild(b);
    a.appendChild(c);

    var r = document.createElement("div");
    r.className = "dir";
    var v = document.createElement("span");
    v.className = "val";
    v.textContent = brl(i.valor);
    var x = document.createElement("button");
    x.className = "del";
    x.textContent = "×";
    x.title = "Apagar";
    x.onclick = function () {
      if (confirm("Apagar este gasto?")) {
        itens = itens.filter(function (z) { return z.id !== i.id; });
        salvar();
        meses();
        mostrar();
      }
    };
    r.appendChild(v);
    r.appendChild(x);

    d.appendChild(a);
    d.appendChild(r);
    L.appendChild(d);
  });
}

document.getElementById("add").onclick = function () {
  var desc = document.getElementById("desc").value.trim();
  var valor = parseFloat(document.getElementById("valor").value);
  var data = document.getElementById("data").value || hoje();
  if (!desc || !(valor > 0)) { alert("Escreva o que foi e o valor."); return; }
  itens.push({ id: Date.now(), desc: desc, valor: valor, data: data, cat: document.getElementById("cat").value });
  salvar();
  document.getElementById("desc").value = "";
  document.getElementById("valor").value = "";
  meses();
  document.getElementById("mes").value = data.slice(0, 7);
  mostrar();
};
document.getElementById("mes").onchange = mostrar;
document.getElementById("data").value = hoje();

carregar();
meses();
mostrar();

// Deixa o app funcionar sem internet e poder ser instalado
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}