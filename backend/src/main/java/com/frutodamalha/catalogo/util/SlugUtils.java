package com.frutodamalha.catalogo.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/** Geração de slugs amigáveis de URL a partir de nomes livres digitados pela administradora. */
public final class SlugUtils {

    private static final Pattern DIACRITICOS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NAO_ALFANUMERICO = Pattern.compile("[^a-z0-9]+");
    private static final Pattern HIFENS_REPETIDOS = Pattern.compile("-{2,}");

    private SlugUtils() {
    }

    public static String gerar(String texto) {
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD);
        semAcento = DIACRITICOS.matcher(semAcento).replaceAll("");

        String slug = NAO_ALFANUMERICO.matcher(semAcento.toLowerCase()).replaceAll("-");
        slug = HIFENS_REPETIDOS.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-|-$", "");
        return slug;
    }
}
