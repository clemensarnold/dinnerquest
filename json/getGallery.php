<?php
    
    $mode = $_POST["mode"];

    if (isset($_GET["ts"])) {
        $mode = 'getMeal';
        $_POST["timestamp"] = $_GET["ts"];
    }

    switch($mode) {

        case 'getGallery':
        case 'addMeal':
        case 'getMeal':
            readWriteData($mode);
            break;

        default:
            break;
    }

    

    function readWriteData($mode) {

        $username = "5060_2";
        $password = "dinner41";
        $servername = "db02.easyserver.at"; 
        $json = '[';

        //connection to the database
        $dbhandle = mysql_connect($servername, $username, $password) or die("Unable to connect to MySQL");
        $db_selected = mysql_select_db('5060_2', $dbhandle );

        if (!$db_selected) {
            die ('Can\'t use 5060_2 : ' . mysql_error());
        }

        switch($mode) {

            case 'getGallery':
            case 'getMeal':
                //  execute the SQL query and return records
                // to come: filter based on cookie

                
                $condition = "WHERE 1";

                if ($mode == 'getMeal') {
                    $condition = "WHERE `meal_timestamp` = '" . $_POST["timestamp"] . "'";
                }

                $sql = "SELECT * FROM `Dinnerquest` " . $condition . "  ORDER BY `meal_id` DESC";

                $result = mysql_query($sql);
                $rowCount = mysql_num_rows($result);
                $counter = 0;

                //fetch tha data from the database
                while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
                    $json .= $row['meal_data'];

                    if ($counter < $rowCount -1) $json .= ',';

                    $counter++;
                }

                $json .= ']';

                echo $json;
                mysql_free_result($result);
                break;

            case 'addMeal':
                $sql = "INSERT INTO Dinnerquest (meal_timestamp, meal_data) VALUES (". $_POST["timestamp"] . ", '" . $_POST["meal"] . "')";
           
                $retval = mysql_query($sql, $dbhandle);

                $return = 'SUCCESS';

                if (!$retval) {
                  die('Could not enter data: ' . mysql_error());
                  $return = 'ERROR';
                }
                
                echo $return; 
                break;
        }



        //close the connection
        mysql_close($dbhandle);
    }

?>


