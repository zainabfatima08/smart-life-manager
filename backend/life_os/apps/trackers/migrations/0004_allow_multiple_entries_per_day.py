# Generated migration to allow multiple mood and sleep entries per day

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trackers', '0001_initial'),
    ]

    operations = [
        # Remove unique constraint that prevents multiple mood entries per day
        migrations.RemoveConstraint(
            model_name='moodentry',
            name='unique_mood_entry_per_day',
        ),
        # Remove unique constraint that prevents multiple sleep entries per day
        migrations.RemoveConstraint(
            model_name='sleepentry',
            name='unique_sleep_entry_per_day',
        ),
    ]
