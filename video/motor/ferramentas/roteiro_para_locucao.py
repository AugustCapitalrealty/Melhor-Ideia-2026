"""Gera o LOCUCAO-elevenlabs.md a partir do ROTEIRO.md, para os dois nunca ficarem diferentes.

Pega as linhas "> " de cada capítulo "## N · título", tira as marcas de fonte [n] e os ⚠, e junta cada cena num parágrafo.
Uso: python roteiro_para_locucao.py <pasta-do-video> [<pasta> ...]   (mostra também palavras e minutos estimados)
Criado em 04/10/2026.
"""
import re, sys
from pathlib import Path

PALAVRAS_POR_MIN = 140  # alemão, Alexander v4, medido em sg02/sg04/sg06 (04/10)


def capitulos(roteiro):
    caps, cap, cena = [], None, None
    for linha in roteiro.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^## (\d+) · (.+?)\s*$", linha)
        if m:
            cap = {"n": int(m.group(1)), "titulo": m.group(2), "cenas": []}; caps.append(cap); cena = None; continue
        if linha.startswith("## "):
            cap = None; continue
        if cap is not None and re.match(r"^\*\*\d+\.\d+ · ", linha):
            cena = []; cap["cenas"].append(cena); continue
        if cap is not None and linha.startswith("> "):
            fala = re.sub(r"\s*⚠?\s*(\[\d+\])+|\s*⚠", "", linha[2:]).strip()
            if cena is None:
                cena = []; cap["cenas"].append(cena)
            cena.append(fala)
    return caps


def main():
    for pasta in map(Path, sys.argv[1:]):
        caps = capitulos(pasta / "ROTEIRO.md")
        titulo = (pasta / "ROTEIRO.md").read_text(encoding="utf-8").splitlines()[0].lstrip("# ").split(" — ")[0]
        saida = [f"# Locução para o ElevenLabs · {titulo}", "",
                 "Gerado de ROTEIRO.md por GERAL/ferramentas/roteiro_para_locucao.py. Não editar à mão: editar o ROTEIRO e gerar de novo.", ""]
        total = 0
        for c in caps:
            texto = "\n\n".join(" ".join(c_) for c_ in c["cenas"] if c_)
            total += len(texto.split())
            saida += [f"## {c['n']} · {c['titulo']}", "", "```", texto, "```", ""]
        (pasta / "LOCUCAO-elevenlabs.md").write_text("\n".join(saida), encoding="utf-8")
        print(f"{pasta.name}: {len(caps)} capítulos · {total} palavras · ~{total / PALAVRAS_POR_MIN:.1f} min")


if __name__ == "__main__":
    main()
