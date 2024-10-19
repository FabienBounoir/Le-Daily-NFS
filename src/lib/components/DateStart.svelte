<script>
	export let startDailyDate;
	export let displayGif;
</script>

<p id="infoTimeDaily">
	<i class="fa-solid fa-calendar-days"></i>
	{`${startDailyDate.getHours()}`.padStart(2, '0') +
		':' +
		`${startDailyDate.getMinutes()}`.padStart(2, '0') +
		':' +
		`${startDailyDate.getSeconds()}`.padStart(2, '0')} -
	{`${startDailyDate.getDate()}`.padStart(2, '0') +
		'/' +
		`${startDailyDate.getMonth() + 1}`.padStart(2, '0') +
		'/' +
		startDailyDate.getFullYear()}
	{displayGif ? '🎥' : ''}
</p>

<style lang="scss">
	#infoTimeDaily {
		position: fixed;
		bottom: 0;
		left: 0;
		padding: 1em;
		font-size: 1.2em;
	}
</style>
