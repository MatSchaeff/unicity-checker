$(document).ready(function () {
    var Nextprot = window.Nextprot;
    var nx = new Nextprot.Client("PeptideViewer", "nextprotTeam");

    function toggleIsoforms(id) {
        $("#" + id + ' #showIsoforms').text("Show isoforms");
        $("#" + id + ' #showIsoforms').click(function () {
            $(this).text(function (i, text) {
                return text === "Show isoforms" ? "Hide isoforms" : "Show isoforms";
            });
            $("#" + id + ' .showEntry').is(':visible') ? $("#" + id + " .showEntry").hide() : $("#" + id + " .showEntry").show();
            $("#" + id + ' .showIsoform').is(':visible') ? $("#" + id + " .showIsoform").hide() : $("#" + id + " .showIsoform").show();
        });
    }
    
    function throwError(pep) {
        console.log("error throwns");
        var peptide = {
            name: pep
        }
        var template2 = HBtemplates['templates/notFound.tmpl'];
        var results2 = template2(peptide);
        $("#peptideResult").append(results2);
        
    }
    
    function entryWithVariant(entry) {
                    var withVariant = false;
                    entry.annotations.forEach(function (o) {
                        if (o.variant) withVariant = true;
                    });
                    return withVariant;
    }
    function entryWithoutVariant(entry) {
        var withoutVariant = false;
        entry.annotations.forEach(function (o) {
            if (!o.variant) withoutVariant = true;
        });
        return withoutVariant;
    }
    
    function addPeptideBox(data, sequence, id) {
        var isoformsLength = 0;
                data.forEach(function (o) {
                    isoformsLength += o.annotations.length;
                });
                var entries = data.map(function (o) {
                    return {
                        name: o.uniqueName,
                        withVariant: entryWithVariant(o),
                        withoutVariant:entryWithoutVariant(o),
                        geneName: o.overview.mainGeneName
                    };
                });
                var entriesLength = data.length;
                var entriesLengthWithoutVariant = entries.filter(function (d) {
                    return d.withVariant === false;
                }).length;
                var entryMatching = {
                    id: id,
                    peptide: sequence,
                    proteotypicity: {
                        withVariant: entriesLength <= 1,
                        withoutVariant: entriesLengthWithoutVariant <= 1,
                        onlyVariant: (entriesLength - entriesLengthWithoutVariant) < 1
                    },
                    entries: entries,
                    isoforms: data.map(function (o) {
                        return o.annotations.map(function (p) {
                            return {
                                entryName: o.uniqueName,
                                variant: p.variant,
                                isoform: Object.keys(p.targetingIsoformsMap)[0],
                                positions: {
                                    first: p.targetingIsoformsMap[Object.keys(p.targetingIsoformsMap)[0]].firstPosition,
                                    last: p.targetingIsoformsMap[Object.keys(p.targetingIsoformsMap)[0]].lastPosition
                                }
                            };
                        });
                    })
                };
                var template = HBtemplates['templates/matchingEntries.tmpl'];
                var results = template(entryMatching);
                $("#peptideResult").append(results);

                toggleIsoforms(id);
    }

    function getProteotypicityInfos() {
        var inputList = $("#variantList").val();
        var pepList = inputList.split(/[\s,]+/);

        pepList.forEach(function (sequence, index) {
            var id = "peptide" + index;
            nx.getEntryforPeptide(sequence).then(function (data) {
                console.log(data);
                
                if (data.length < 1) throwError(sequence);
                
                else addPeptideBox(data, sequence, id);
            });
        });
    }

    $("#submitList").click(function () {
        $("#peptideResult").html("");
        getProteotypicityInfos();
    });
});