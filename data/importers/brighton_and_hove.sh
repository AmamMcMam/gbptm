#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/kml http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml \
 | \
 ../../cli/transform -t ../transformers/geohash_property.js \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Brighton & Hove City Council' \
 | \
 ../../cli/write $VERBOSE $VVERBOSE -w ../writers/process_loo_report.js