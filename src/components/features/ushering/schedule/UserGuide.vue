<script setup lang="ts">
import { useVueToPrint } from 'vue-to-print';
import Icon4dx from '@/assets/symbols/Icon4dx.vue';
import { useTemplateRef } from 'vue';

const { handlePrint } = useVueToPrint({
    content: useTemplateRef('print-component'),
    documentTitle: "Gebruiksaanwijzing tijdenlijstje"
})
</script>

<template>
    <!-- <h3>Gebruiksaanwijzing</h3> -->
    <Tabs>
        <Tab value="Gebruiksaanwijzing tijdenlijstje">
            <div id="user-manual" ref="print-component" contenteditable spellcheck="false">
                <p>
                    Het tijdenlijstje is op de werkvloer erg waardevol, omdat het op een overzichtelijke manier veel
                    informatie presenteert. Elke filmvoorstelling krijgt zijn eigen rij in de tabel, met daarin
                    wat
                    basisinformatie. Standaard is daarbij het volgende zichtbaar:
                </p>
                <ul id="info-list">
                    <li>Zaal</li>
                    <li>Tijd van aanvang</li>
                    <li>Tijd van aftiteling</li>
                    <li>Titel</li>
                    <li>PLF's, specials en taal</li>
                    <li>Leeftijdsclassificatie</li>
                </ul>
                <p>
                    Ook kunnen de tijd van de pauze, start hoofdfilm, einde voorstelling en de volgende aanvangstijd van
                    dezelfde zaal worden weergegeven.
                    <br><br>
                    Naast deze basisinformatie bevat de tijdenlijst ook een aantal annotaties:
                </p>
                <ul id="annotations">
                    <li>
                        <div inert class="sample" id="double-usherout">
                            <div class="mini-table">
                                <div class="table-row">16:50:11</div>
                                <div class="table-row">16:52:33</div>
                            </div>
                        </div>
                        <span><b>Dubbele uitloop</b>: er zit minder dan 10 minuten tussen de uitlopen.</span>
                    </li>
                    <li>
                        <div inert class="sample" id="long-gap">
                            <div class="mini-table">
                                <div class="table-row">12:50:12</div>
                                <div class="table-row">13:04:57</div>
                            </div>
                        </div>
                        <span><b>Gat tussen uitlopen</b>: er zit meer dan 35 minuten tussen de uitlopen.</span>
                    </li>
                    <li>
                        <div inert class="sample" id="post-credits"><span></span>
                            <div class="mini-table"><span></span>
                                <div class="table-row">23:30:01</div>
                                <div class="table-row">23:43:07 <span>+11</span></div>
                                <div class="table-row">23:55:15 <span>+8</span></div>
                            </div>
                        </div>
                        <span><b>Post-credits-scène</b>: bij films waarbij bezoekers vaak langer blijven zitten (zoals
                            bij
                            een
                            post-credits-scène), kan de duur van de aftiteling worden
                            weergegeven.</span>
                    </li>
                    <li>
                        <div inert class="sample" id="plf-overlap">
                            <div class="mini-table">
                                <Icon4dx class="plf-icon" />
                                <div class="table-row">21:09:01</div>
                                <div class="table-row">21:21:46</div>
                            </div>
                        </div>
                        <span><b>4DX-inloop</b>: het icoon geeft de aanvangstijd van de 4DX aan t.o.v. de uitlopen.
                            Uitlopen
                            met een stippellijntje zijn tijdens de 4DX-inloop (van 17 minuten voor aanvangstijd tot
                            start
                            hoofdfilm).</span>
                    </li>
                    <li>
                        <div inert class="sample" id="preshow-duration">
                            <div class="mini-table">
                                <div class="table-row">10:00
                                </div>
                                <div class="table-row" style="padding-left: 0; font-style: italic;"><span
                                        style="display: inline-block; transform: translateX(-14px);">(4DX) </span>10:20
                                    <span style="opacity: .5; font-style: normal;">+17</span>
                                </div>
                                <div class="table-row">10:10
                                </div>
                            </div>
                        </div>
                        <span><b>4DX-voorstelling</b>: wordt cursief weergegeven. De tijd tussen de aanvangstijd en
                            start
                            hoofdfilm kan worden weergegeven.</span>
                    </li>
                    <li>
                        <div inert class="sample" id="age-restriction">
                            <div class="mini-table">
                                <div class="table-row">
                                    <span style="display: inline-block; padding-right: 12px;">(NL)</span> <span
                                        style="opacity: .5;">AL</span>
                                </div>
                                <div class="table-row" style="font-weight: bold;">16</div>
                                <div class="table-row" style="font-weight: bold;">
                                    <span style="margin-left: -12px; padding-right: 12px;">IMAX 3D</span> 18
                                </div>
                            </div>
                        </div>
                        <span><b>16+ en 18+</b>: worden vetgedrukt weergegeven.</span>
                    </li>
                </ul>
                <p>Als een film is gemarkeerd met een post-credits-scène, dan worden de berekeningen voor de tijd tussen uitlopen daar ook op aangepast.</p>
            </div>
            <br>
            <Button class="full" @click="handlePrint">
                <Icon>print</Icon>
                Gebruiksaanwijzing afdrukken
            </Button>
            <br><br>
            <small>Let op: deze gebruiksaanwijzing houdt geen rekening met verschillen in configuratie en tussen theaters. Zo nodig kan bovenstaande inhoud worden aangepast. Voel je vrij om het te verwerken in bijvoorbeeld een inwerkboekje als naslagwerk!</small>
        </Tab>
        <Tab value="Gebruiksaanwijzing website">
            <p>
                Om van de volledige functionaliteit gebruik te maken, moet er worden ingelogd met een account. Bij een
                geslaagde verbinding verschijnt er een groene bol bij het uploadgedeelte.
                <br><br>
                Download een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) en upload hem door deze te
                slepen naar de pagina of middels de knop <b>Bladeren</b>.
                <br><br>
                Ga vervolgens naar een werkplek waarvandaan geprint kan worden. Bezoek daar deze zelfde pagina en zorg
                ervoor dat er is ingelogd met hetzelfde account. Het zojuist geüploade bestand is nu ook hier
                beschikbaar.
                Controleer of de voorstellingen voor de correcte dag zijn ingeladen!
                <br><br>
                Pas eventueel de instellingen aan om de gewenste informatie weer te geven. Alle tekst op het
                tijdenlijstje kan ook handmatig worden aangepast en er is ruimte voor extra opmerkingen onderin.
                <br><br>
                Druk daarna op <b>Afdrukken</b>.
                Als er veel voorstellingen zijn, kan de tijdenlijst in tweeën worden gesplitst. Er is dan een overlap
                van 4 voorstellingen tussen de twee delen van de tijdenlijst.
            </p>
        </Tab>
    </Tabs>
</template>

<style>
#info-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

#annotations {
    list-style: none;
    padding: 0;

    &>li {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: start;
        gap: 16px;
        margin-bottom: 6px;
    }
}

.sample {
    margin: 1px;
    box-shadow: 0 0 0 1px light-dark(#0003, #fff3);
    border-radius: 5px;
    overflow: hidden;
    height: 43px;
    display: flex;

    &>.mini-table {
        place-self: center;

        &>.table-row {
            width: 97px;
            padding-left: 12px;
            font: 12.5px/21.5px Arial, Helvetica, sans-serif;

            &:nth-child(odd) {
                background: light-dark(#e4e4e4, #ffffff14);
            }
        }
    }
}

#double-usherout {
    position: relative;

    &>.mini-table>.table-row {
        padding-left: 30px;
    }

    &::after {
        content: '';
        position: absolute;
        left: 22px;
        top: 50%;
        translate: 0 -50%;
        display: block;
        height: 22px;
        width: 22px;
        border-radius: 50%;
        outline: 2px solid currentColor;
        clip-path: inset(-3px calc(100% - 5px) -3px -3px);
        opacity: .5;
    }
}

#long-gap {
    position: relative;

    &>.mini-table>.table-row {
        padding-left: 0;
        text-align: center;
    }

    &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        translate: -50% -50%;
        display: block;
        width: 62px;
        border-bottom: 2px dotted currentColor;
        opacity: .5;
    }
}

#plf-overlap {
    position: relative;

    &>.mini-table>.table-row {
        padding-left: 48px;
    }

    .plf-icon {
        position: absolute;
        top: 50%;
        left: 0;
        height: 11px;
        translate: 0 -50%;
        fill: currentColor;
    }

    &::after {
        content: '';
        position: absolute;
        left: 32px;
        top: 0;
        display: block;
        height: 22px;
        border-left: 2px dashed currentColor;
        opacity: .5;
    }
}

#post-credits {
    position: relative;

    &>.mini-table>.table-row {
        &>span {
            opacity: .5;
        }
    }
}

#preshow-duration {
    &>.mini-table>.table-row {
        padding-left: 33px;
    }
}

#age-restriction {
    &>.mini-table>.table-row {
        text-align: right;
        padding-right: 6px;
    }
}

@media print {
    @page {
        size: A4 portrait;
    }

    #user-manual {
        color: #000;
        color-scheme: light;

        button {
            display: none;
        }
    }
}
</style>