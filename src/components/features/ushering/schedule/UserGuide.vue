<script setup lang="ts"></script>

<template>
    <h3>Gebruiksaanwijzing</h3>
    <Tabs>
        <Tab value="Tijdenlijst maken">
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
                Pas eventueel de instellingen aan om de gewenste informatie weer te geven. Druk dan op <b>Afdrukken</b>.
                Als er veel voorstellingen zijn, kan de tijdenlijst in tweeën worden gesplitst. Er is dan een overlap
                van 4 voorstellingen tussen de twee delen van de tijdenlijst.
            </p>
        </Tab>
        <Tab value="Tijdenlijst gebruiken">
            <p>
                Het tijdenlijstje is op de werkvloer erg waardevol, omdat het op een overzichtelijke wijze veel
                informatie presenteert. Elke voorstelling van de dag krijgt zijn eigen rij in de tabel, met daarin wat
                basisinformatie. Standaard is daarbij het volgende opgenomen:
            </p>
            <ul style="display: grid; grid-template-columns: repeat(2, 1fr);">
                <li>Zaalnummer</li>
                <li>Tijd van aanvang</li>
                <li>Tijd van aftiteling</li>
                <li>Titel van de film</li>
                <li>PLF's, specials en taal</li>
                <li>Leeftijdsclassificatie</li>
            </ul>
            <p>
                Ook kunnen de tijd van de pauze, start hoofdfilm, einde voorstelling en de volgende aanvangstijd van
                dezelfde zaal worden weergegeven.
            </p>
        </Tab>
    </Tabs>
</template>