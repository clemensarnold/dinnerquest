<?php
    $myFile = "meals.json";
    $fh = fopen($myFile, 'w') or die("can't open file");
    $stringData = $_POST["data"];
    $return = fwrite($fh, $stringData);
    fclose($fh);

    $return = 'ERROR';
    if ($stringData) $return = 'SUCCESS';
    echo $return; 
?>