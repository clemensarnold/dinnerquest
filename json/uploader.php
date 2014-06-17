<?
$config['admin_username'] = "dinner";
$config['admin_password'] = "game123!";
	 
if (!(@$_SERVER['PHP_AUTH_USER'] == $config['admin_username'] && $_SERVER['PHP_AUTH_PW'] == $config['admin_password'])) {
	    header("WWW-Authenticate: Basic realm=\"dinnergame\"");
	    header("HTTP/1.0 401 Unauthorized");
	    echo 'Cancel';
    exit;
}
?>


<?
if(isset($_POST['yourtext']))
{
	file_put_contents("data.json", $_POST['yourtext']);
}
?>

Change game data here:<br />
<form method=post>
<textarea style="width:100%; height:400px" name="yourtext"><?=htmlspecialchars(file_get_contents("data.json")); ?></textarea>
<input type="submit" />
</form>