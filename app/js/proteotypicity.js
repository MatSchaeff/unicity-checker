$(document).ready(function () {
    var Nextprot = window.Nextprot;
    var nx = new Nextprot.Client("PeptideViewer", "nextprotTeam");
//    var exemples = "LQELFLQEVR, AATDFVQEMR, TKMGLYYSYFK, \nCVSNTPGYCR, TTETLIILSR, IGTTVIDLENR"
    
//    $("#variantList").text(exemples);

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
    function toggleProteo(){
        $("#onlyProteo").click(function(){
            if ($(this).is(':checked')) {
                $(".nonproteo").hide();
                if ($("#exceptProteo").is(":checked")){
                    $("#exceptProteo").prop("checked",false);
                    $(".proteo").show();
                }
            }
            else $(".nonproteo").show();
            var pepShowed = $("#peptideResult>div:visible").length;
            $("#countPepShowed").text(pepShowed);
        })
        $("#exceptProteo").click(function(){
            if ($(this).is(':checked')) {
                $(".proteo").hide();
                if ($("#onlyProteo").is(":checked")){
                    $("#onlyProteo").prop("checked",false);
                    $(".nonproteo").show();
                }
            }
            else $(".proteo").show();
            var pepShowed = $("#peptideResult>div:visible").length;
            $("#countPepShowed").text(pepShowed);
        })
    }
    
    function throwPeptideError(pep) {
        var peptide = {
            name: pep
        }
        var template2 = HBtemplates['app/templates/notFound.tmpl'];
        var results2 = template2(peptide);
        $("#peptideResult").prepend(results2);
        
    }
    
    function throwNbError(pep) {
        var template3 = HBtemplates['app/templates/limitExceeded.tmpl'];
        $("#peptideResult").prepend(template3);
        $(".shaft-load3").remove();
    }
    
    function throwAPIError(message) {
        var template4 = HBtemplates['app/templates/apiCallFail.tmpl'];
        var fillTemplate = template4(message);
        $("#peptideResult").prepend(fillTemplate);
        $(".shaft-load3").remove();
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
    
    function addPeptideBox(data, sequence, id, pepTotalCount) {
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
                    return d.withoutVariant === true;
                }).length;
                var entriesLengthWithVariant = entries.filter(function (d) {
                    return d.withVariant === true;
                }).length;
                var entryMatching = {
                    id: id,
                    peptide: sequence,
                    proteotypicity: {
                        withVariant: entriesLength <= 1,
                        withoutVariant: entriesLengthWithoutVariant <= 1,
                        onlyVariant: entriesLengthWithVariant < 1
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
                var template = HBtemplates['app/templates/matchingEntries.tmpl'];
                var results = template(entryMatching);
                if ($("#peptideResult>div").length > pepTotalCount-10) $(".shaft-load3").remove();
                $("#peptideResult").append(results);

                toggleIsoforms(id);
    }
//    function getMaxList(str){
//        var charToCut = "";
//        var posToCut = 2001;
//        while (charToCut !== ",") {
//            posToCut -= 1;
//            charToCut = str[posToCut];
//        }
//        return posToCut;
//    }
    function getApiCallList(listPep){
        var list = [[]];
        var strLength = 0;
        var index = 0;
        for (var i = 0; i < listPep.length; i++){
            console.log(i);
            if (strLength + listPep[i].length < 2000) {
                strLength += listPep[i].length;
                list[index].push(listPep[i]);
            }
            else {
                index += 1;
                strLength = 0;
                list.push([]);
            }
        }
        return list;
        
//        if (strLength > 2000) {
//            var posToCut = getMaxList(str);
//            list.push(str.substring(0,posToCut));
//            getApiCallList(list, str.substring(posToCut+1));
//            return list;
//        }
//        else {
//            list.push(str);
//            return list;
//        }
    }
    
    function getPeptideByEntry(entry, isoform){
        var peptideData = [];
        nx.getAnnotationsByCategory(entry, "peptide-mapping").then(function(data){
            data.annot.forEach(function(d){
                if (d.targetingIsoformsMap.hasOwnProperty(isoform)){
                    var positions = d.targetingIsoformsMap[isoform];
                    peptideData.push({start: positions.firstPosition, end:positions.lastPosition});
                }
            })
            nx.getProteinSequence(entry).then(function(isos){
                var sequence = isos.filter(function(seq){return seq.uniqueName === isoform})[0].sequence;
                var peptideList = "";
                peptideData.forEach(function(p){
                    peptideList += sequence.substring(p.start-1,p.end) + ",";
                })
                getProteotypicityInfos(peptideList);
            })
        }).catch(function(error) {
                    console.log(error.responseText);
                    var errorMessage = JSON.parse(error.responseText);
                    throwAPIError(errorMessage.message);
                })
    }
    
    // FOR NEXT VERSION
//    function exportPepList(){
//        $("a#downloadList").click(function() {
//            var peptide_list = "";
//            $("#peptideResult>div:visible").each(function(){
//                peptide_list += $(this).attr("id") + "\n";
//            });
//            this.href = "data:text/plain;charset=UTF-8," + encodeURIComponent(peptide_list);
//        });
//    }
    
    function listOrEntry(str){
        // FOR NEXT VERSION
//        if (str.startsWith("NX_")) {
//            parseStr = str.split("-");
//            var entry = parseStr[0];
//            var iso = str;
//            getPeptideByEntry(entry, iso);
//        }
//        else getProteotypicityInfos(str);
        
        getProteotypicityInfos(str);
    }

    function getProteotypicityInfos(str) {
//        var test = str.split(/[\s,;]+/g);
//        console.log("test");
//        console.log(test);
//        var pepListString = str.replace(/\s+/g, '');
        var pepListTotal = str.split(/[\s,;]+/g);
        if (pepListTotal[pepListTotal.length-1] === "") pepListTotal.pop();
        console.log(pepListTotal);
//        if (pepListString.endsWith(",")) pepListString = pepListString.slice(0,-1);
        console.log(pepListTotal.length);
//        var pepTotalCount = pepListString.split(",").length;
//        console.log(pepTotalCount);
        if (pepListTotal.length < 1000) {
            $("#countPepTotal").text(pepListTotal.length);
//            console.log("total peplist length : "+pepListString.length);
            var apiCallList = getApiCallList(pepListTotal);
            console.log("nb of api calls : "+apiCallList.length);
            console.log("apiCallList");
            console.log(apiCallList);
//            var lastCall = false;
            apiCallList.forEach(function(pepList){
//                console.log("string length : "+ac.length);
                var pepListString = pepList.join(",");
                console.log("pep count : "+pepList.length);
//                if (callIndex === apiCallList.length-1) lastCall=true;
                
                nx.getEntryforPeptide(pepListString).then(function (data) {
                    pepList.forEach(function (sequence) {
                        var id = sequence;
                        var new_data = $.extend(true,[],data);
                        new_data.forEach(function(d,i){
                            new_data[i].annotations = d.annotations.filter(function(f){return f.cvTermName === sequence});
                        })
                        new_data = new_data.filter(function(d){return d.annotations.length > 0});
                        if (new_data.length < 1) throwPeptideError(sequence);
                        else addPeptideBox(new_data, sequence, id, pepListTotal.length);
                    });
                    var pepShowed = $("#peptideResult>div:visible").length;
                    $("#countPepShowed").text(pepShowed);
                }).catch(function(error) {
                    console.log(error.responseText);
                    var errorMessage = JSON.parse(error.responseText);
                    throwAPIError(errorMessage.message);
                })
            });
            toggleProteo();
        }
        else throwNbError();
    }

    $("#submitList").click(function () {
        
        //uncheck the filters
        $( ".filters input:checked" ).prop('checked',false);
        
        //reset the counter for visible peptides
        $("#countPepShowed").text("0");
        $("#countPepTotal").text("0");
        
        //add the loader
        var source = $("#loader-template").html();
        $("#peptideResult").html(source);

//        $("#scn_alignment").fadeIn('slow');
        
        //begin the computation
        var input = $("#variantList").val().toUpperCase();
        listOrEntry(input);
        
        // FOR NEXT VERSION
//        exportPepList();
    });
});